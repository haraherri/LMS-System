import Stripe from "stripe";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { CustomError } from "../middlewares/error.js";
import { User } from "../models/user.model.js";

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
        { path: "lectures" }, // Populate lectures inside courseId
      ],
    });

    if (!coursePurchase) {
      // If not purchased, still return the course details
      const course = await Course.findById(courseId)
        .populate("creator", "name email photoUrl")
        .populate("lectures");

      if (!course) {
        throw new CustomError("Course not found", 404);
      }

      return res.status(200).json({
        success: true,
        course,
        purchaseStatus: null, // Indicate that the course has not been purchased
      });
    }

    return res.status(200).json({
      success: true,
      course: coursePurchase.courseId, // Access populated course details
      purchaseStatus: coursePurchase.status, // Return the actual purchase status
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPurchasedCourse = async (req, res, next) => {
  try {
    const userId = req.id;

    const purchasedCourses = await CoursePurchase.find({
      userId, // Filter by userId
      status: "Success",
    })
      .populate({
        path: "courseId",
        populate: [
          { path: "creator", select: "name email photoUrl" }, // Populate creator
          { path: "lectures" }, // Populate lectures inside courseId
        ],
      })
      .exec();

    // purchasedCourses will be an empty array [] if no courses are found
    return res.status(200).json({
      success: true,
      purchasedCourses, // Return the array, even if empty
    });
  } catch (error) {
    next(error);
  }
};
