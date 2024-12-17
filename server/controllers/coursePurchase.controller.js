import Stripe from "stripe";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { CustomError } from "../middlewares/error.js";
import { User } from "../models/user.model.js";
import { Section } from "../models/section.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res, next) => {
  try {
    const { id: userId } = req;
    const { courseId } = req.body;

    // 1. Get course details & validate
    const course = await Course.findById(courseId);
    if (!course) {
      throw new CustomError("Course not found", 404);
    }

    // 2. Check if course is published
    if (!course.isPublished) {
      throw new CustomError("Course is not published yet", 400);
    }

    // 3. Create Stripe session first
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/course-progress/${courseId}`,
      cancel_url: `${process.env.CLIENT_URL}/course-detail/${courseId}`,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: course.coursePrice * 100,
            product_data: {
              name: course.courseTitle,
              description: course.subTitle || "",
              images: [course.courseThumbnail],
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        courseId, // Keep courseId only
      },
    });

    // 4. Create purchase record with session ID
    await CoursePurchase.create({
      courseId,
      userId, // Save userId in CoursePurchase
      price: course.coursePrice,
      status: "Pending",
      paymentId: session.id,
    });

    return res.status(200).json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    next(error); // Pass error to errorHandler
  }
};

export const stripeWebhook = async (req, res, next) => {
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // 1. Get userId from CoursePurchase using session.id
      const purchase = await CoursePurchase.findOne({ paymentId: session.id });

      if (!purchase) {
        throw new CustomError(
          `Purchase not found for session ID: ${session.id}`,
          404
        );
      }

      const { courseId, userId } = purchase;

      // 2. Update purchase status
      purchase.status = "Success";
      await purchase.save();

      // 3. Update User and Course (without transaction)
      try {
        await User.findByIdAndUpdate(userId, {
          $addToSet: { enrolledCourses: courseId },
        });
      } catch (error) {
        // Use next() to pass error to errorHandler
        next(
          new CustomError(
            `Failed to update user ${userId}: ${error.message}`,
            500
          )
        );
        return; // Stop further execution
      }

      try {
        await Course.findByIdAndUpdate(courseId, {
          $addToSet: { enrolledStudents: userId },
        });
      } catch (error) {
        // Use next() to pass error to errorHandler
        next(
          new CustomError(
            `Failed to update course ${courseId}: ${error.message}`,
            500
          )
        );
        return; // Stop further execution
      }

      console.log(
        `Payment successful for session ${session.id}, course ${courseId}, user ${userId}`
      );
    } else {
      console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true }); // Send success response to Stripe
  } catch (error) {
    next(error); // Pass error to errorHandler
  }
};

export const getCourseDetailWithPurchaseStatus = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const coursePurchase = await CoursePurchase.findOne({
      userId,
      courseId,
    }).populate({
      path: "courseId",
      populate: [
        { path: "creator", select: "name email photoUrl" },
        {
          path: "sections",
          populate: {
            path: "lectures",
          },
        },
      ],
    });

    if (!coursePurchase) {
      const course = await Course.findById(courseId).populate([
        { path: "creator", select: "name email photoUrl" },
        {
          path: "sections",
          populate: {
            path: "lectures",
          },
        },
      ]);

      if (!course) {
        throw new CustomError("Course not found", 404);
      }

      return res.status(200).json({
        success: true,
        course,
        purchaseStatus: null,
      });
    }

    return res.status(200).json({
      success: true,
      course: coursePurchase.courseId,
      purchaseStatus: coursePurchase.status,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPurchasedCourse = async (req, res, next) => {
  try {
    const userId = req.id;

    const purchasedCourses = await CoursePurchase.find({
      userId,
      status: "Success",
    }).populate({
      path: "courseId",
      populate: [
        { path: "creator", select: "name email photoUrl" },
        {
          path: "sections",
          populate: {
            path: "lectures",
          },
        },
      ],
    });

    return res.status(200).json({
      success: true,
      purchasedCourses,
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueAnalytics = async (req, res, next) => {
  try {
    const analytics = await CoursePurchase.aggregate([
      {
        $match: { status: "Success" }, // Filter only successful purchases
      },
      {
        $lookup: {
          from: "courses", // Join with courses collection
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      {
        $unwind: "$course", // Deconstruct the course array
      },
      {
        $group: {
          _id: "$courseId", // Group by courseId
          courseTitle: { $first: "$course.courseTitle" }, // Get course title
          totalSales: { $sum: 1 }, // Count purchases per course
          totalRevenue: { $sum: "$price" }, // Sum revenue per course
        },
      },
      {
        $sort: { totalRevenue: -1 }, // Sort by total revenue descending
      },
      {
        $group: {
          _id: null, // Group all courses together
          courses: {
            $push: {
              courseId: "$_id",
              courseTitle: "$courseTitle",
              totalSales: "$totalSales",
              totalRevenue: "$totalRevenue",
            },
          }, // Push course data into an array
          overallTotalSales: { $sum: "$totalSales" }, // Calculate overall total sales
          overallTotalRevenue: { $sum: "$totalRevenue" }, // Calculate overall total revenue
        },
      },
      {
        $project: {
          _id: 0, // Exclude _id field
          courses: 1, // Include courses array
          overallTotalSales: 1, // Include overall total sales
          overallTotalRevenue: 1, // Include overall total revenue
          averagePrice: {
            $cond: {
              if: { $gt: ["$overallTotalSales", 0] },
              then: {
                $divide: ["$overallTotalRevenue", "$overallTotalSales"],
              },
              else: 0,
            },
          }, // Calculate average price
        },
      },
    ]);

    if (!analytics || analytics.length === 0) {
      // If no data found, return default values
      return res.status(200).json({
        success: true,
        courses: [],
        overallTotalSales: 0,
        overallTotalRevenue: 0,
        averagePrice: 0,
      });
    }

    return res.status(200).json({
      success: true,
      ...analytics[0], // Return the first element of the analytics array
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicCourseDetail = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate("creator", "name photoUrl")
      .populate({
        path: "sections",
        select: "sectionTitle",
        populate: {
          path: "lectures",
          select: "lectureTitle isPreviewFree videoUrl", // Include videoUrl for preview lectures
        },
      });

    if (!course) {
      throw new CustomError("Course not found", 404);
    }

    // Filter out sensitive data, but keep videoUrl for preview lectures
    const publicCourseData = {
      courseTitle: course.courseTitle,
      subTitle: course.subTitle,
      description: course.description,
      category: course.category,
      courseLevel: course.courseLevel,
      coursePrice: course.coursePrice,
      courseThumbnail: course.courseThumbnail,
      creator: course.creator,
      sections: course.sections.map((section) => ({
        sectionTitle: section.sectionTitle,
        lectures: section.lectures.map((lecture) => ({
          lectureTitle: lecture.lectureTitle,
          isPreviewFree: lecture.isPreviewFree,
          videoUrl: lecture.isPreviewFree ? lecture.videoUrl : null, // Only provide videoUrl if isPreviewFree is true
        })),
      })),
      createdAt: course.createdAt,
      enrolledStudentsCount: course.enrolledStudents.length,
    };

    return res.status(200).json({
      success: true,
      course: publicCourseData,
    });
  } catch (error) {
    next(error);
  }
};
