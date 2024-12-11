import { CustomError } from "../middlewares/error.js";
import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { deleteVideoFromMinio } from "../utils/minio.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js"; // Import Cloudinary functions
import fs from "fs";

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
    const courses = await Course.find({ creator: userId }).populate({
      path: "sections",
      populate: {
        path: "lectures",
      },
    });
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
      // **Changes for Cloudinary:**
      // 1. Delete old thumbnail from Cloudinary (if exists)
      if (course.courseThumbnail) {
        const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId);
      }

      // 2. Upload new thumbnail to Cloudinary
      const { secure_url } = await uploadMedia(thumbnail.path);
      updateData.courseThumbnail = secure_url;
      // delete temporary file after uploading
      fs.unlink(thumbnail.path, (err) => {
        if (err) {
          console.error("Error deleting temporary file:", err);
        }
      });
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
    // delete temporary file if an error occurs
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error("Error deleting temporary file:", err);
        }
      });
    }
    next(error);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate({
      path: "sections",
      populate: {
        path: "lectures",
      },
    });
    if (!course) {
      throw new CustomError("Course not found", 404);
    }
    return res.status(200).json({ course });
  } catch (error) {
    next(error);
  }
};

export const toggleCoursePublish = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { publish } = req.query;

    const course = await Course.findByIdAndUpdate(
      courseId,
      { isPublished: publish },
      { new: true }
    );

    if (!course) {
      throw new CustomError("Course not found", 404);
    }

    return res.status(200).json({
      success: true,
      message: `Course ${
        course.isPublished ? "published" : "unpublished"
      } successfully!`,
    });
  } catch (error) {
    next(error);
  }
};

export const getPublishCourse = async (req, res, next) => {
  try {
    const courses = await Course.find({ isPublished: true }).populate([
      { path: "creator", select: "name photoUrl" },
      {
        path: "sections",
        populate: {
          path: "lectures",
        },
      },
    ]);
    if (!courses) {
      throw new CustomError("No courses found", 404);
    }
    return res.status(200).json({ courses });
  } catch (error) {
    next(error);
  }
};

export const removeCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      throw new CustomError("Course not found", 404);
    }

    // Delete course thumbnail if exists (using Cloudinary)
    if (course.courseThumbnail) {
      const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
      await deleteMediaFromCloudinary(publicId);
    }

    // Delete all lectures and their videos (using MinIO)
    for (const lectureId of course.lectures) {
      const lecture = await Lecture.findById(lectureId);
      if (lecture && lecture.videoUrl) {
        const videoFilename = lecture.videoUrl.split("/").pop().split("?")[0];
        await deleteVideoFromMinio(videoFilename);
      }
      await Lecture.findByIdAndDelete(lectureId);
    }

    // Delete course
    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully! 🎉",
    });
  } catch (error) {
    next(error);
  }
};
