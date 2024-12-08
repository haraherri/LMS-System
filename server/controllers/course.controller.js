import { CustomError } from "../middlewares/error.js";
import { Course } from "../models/course.model.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

export const createCourse = async (req, res, next) => {
  try {
    const { courseTitle, category } = req.body;

    if (!courseTitle || !category) {
      throw new CustomError("Please provide all required fields", 400);
    }

    const course = await Course.create({
      courseTitle,
      category,
      creator: req.id,
    });

    return res.status(201).json({
      message: "Course created successfully! 🎉",
      course,
    });
  } catch (error) {
    next(error);
  }
};

export const getCreatorCourses = async (req, res, next) => {
  try {
    const userId = req.id;
    const courses = await Course.find({ creator: userId });
    if (!courses) {
      throw new CustomError("No courses found", 404);
    }
    return res.status(200).json({ courses });
  } catch (error) {
    next(error);
  }
};

export const editCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      coursePrice,
    } = req.body;
    const thumbnail = req.file;

    const course = await Course.findById(courseId);
    if (!course) {
      throw new CustomError("Course not found", 404);
    }

    const updateData = {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      coursePrice,
    };

    // Handle thumbnail update if provided
    if (thumbnail) {
      if (course.courseThumbnail) {
        const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId);
      }
      const { secure_url } = await uploadMedia(thumbnail.path);
      updateData.courseThumbnail = secure_url;
    }

    const updatedCourse = await Course.findByIdAndUpdate(courseId, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      course: updatedCourse,
      message: "Course updated successfully!",
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      throw new CustomError("Course not found", 404);
    }
    return res.status(200).json({ course });
  } catch (error) {
    next(error);
  }
};
