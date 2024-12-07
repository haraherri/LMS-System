import { CustomError } from "../middlewares/error.js";
import { Course } from "../models/course.model.js";

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
