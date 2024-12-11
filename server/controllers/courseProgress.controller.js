import { CustomError } from "../middlewares/error.js";
import { Course } from "../models/course.model.js";
import { CourseProgress } from "../models/courseProgress.model.js";
import { Section } from "../models/section.model.js";

export const getCourseProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;
    const courseProgress = await CourseProgress.findOne({
      userId,
      courseId,
    }).populate("lectureProgress.lectureId");

    // Populate 'sections' and then 'lectures' within each section
    const courseDetails = await Course.findById(courseId).populate({
      path: "sections",
      populate: {
        path: "lectures",
      },
    });

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
      (lecture) => lecture.lectureId.toString() === lectureId
    );

    if (lectureIndex !== -1) {
      courseProgress.lectureProgress[lectureIndex].viewed = true;
    } else {
      courseProgress.lectureProgress.push({
        lectureId,
        viewed: true,
      });
    }

    // Find the section containing the lecture
    const section = await Section.findOne({ lectures: lectureId });
    if (!section) {
      throw new CustomError("Section not found for this lecture", 404);
    }

    // Count total lectures in the course
    const course = await Course.findById(courseId).populate("sections");
    let totalLectures = 0;
    course.sections.forEach((sec) => (totalLectures += sec.lectures.length));

    const lectureProgressLength = courseProgress.lectureProgress.filter(
      (lecture) => lecture.viewed
    ).length;

    // Check if all lectures are viewed
    if (totalLectures === lectureProgressLength) {
      courseProgress.completed = true;
    } else {
      courseProgress.completed = false; // Mark as incomplete if not all lectures are viewed
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
