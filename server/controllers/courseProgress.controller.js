import { CustomError } from "../middlewares/error.js";
import { Course } from "../models/course.model.js";
import { CourseProgress } from "../models/courseProgress.model.js";

export const getCourseProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;
    const courseProgress = await CourseProgress.findOne({
      userId,
      courseId,
    }).populate("lectureProgress.lectureId");

    const courseDetails = await Course.findById(courseId).populate("lectures");
    if (!courseDetails) {
      throw new CustomError("Course not found", 404);
    }

    if (!courseProgress) {
      return res.status(200).json({
        data: {
          courseDetails,
          progress: null,
          completed: false,
        },
      });
    }

    return res.status(200).json({
      data: {
        courseDetails,
        progress: courseProgress.lectureProgress,
        completed: courseProgress.completed,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateLectureProgress = async (req, res, next) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.id;

    let courseProgress = await CourseProgress.findOne({ courseId, userId });

    if (!courseProgress) {
      courseProgress = new CourseProgress({
        userId,
        courseId,
        completed: false,
        lectureProgress: [],
      });
    }

    const lectureIndex = courseProgress.lectureProgress.findIndex(
      (lecture) => lecture.lectureId == lectureId
    );

    if (lectureIndex !== -1) {
      courseProgress.lectureProgress[lectureIndex].viewed = true;
    } else {
      courseProgress.lectureProgress.push({
        lectureId,
        viewed: true,
      });
    }

    const lectureProgressLength = courseProgress.lectureProgress.filter(
      (lecture) => lecture.viewed
    ).length;

    const course = await Course.findById(courseId);
    if (course.lectures.length === lectureProgressLength) {
      courseProgress.completed = true;
    }

    await courseProgress.save();

    return res.status(200).json({
      message: "Lecture progress updated successfully!",
    });
  } catch (error) {
    next(error);
  }
};

export const markAsCompleted = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress) {
      throw new CustomError("Course progress not found", 404);
    }

    courseProgress.lectureProgress.map((lecture) => (lecture.viewed = true));
    courseProgress.completed = true;
    await courseProgress.save();

    return res.status(200).json({
      message: "Course marked as completed!",
    });
  } catch (error) {
    next(error);
  }
};

export const markAsInCompleted = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress) {
      throw new CustomError("Course progress not found", 404);
    }

    courseProgress.lectureProgress.map((lecture) => (lecture.viewed = false));
    courseProgress.completed = false;
    await courseProgress.save();

    return res.status(200).json({
      message: "Course marked as incompleted!",
    });
  } catch (error) {
    next(error);
  }
};
