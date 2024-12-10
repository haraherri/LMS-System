import { CustomError } from "../middlewares/error.js";
import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { deleteVideoFromMinio, uploadVideoToMinio } from "../utils/minio.js";

export const createLecture = async (req, res, next) => {
  try {
    const { lectureTitle } = req.body;
    const { courseId } = req.params;

    if (!lectureTitle || !courseId) {
      throw new CustomError("Please provide all required fields", 400);
    }

    const lecture = await Lecture.create({ lectureTitle });

    const course = await Course.findById(courseId);
    if (course) {
      course.lectures.push(lecture._id);
      await course.save();
    }

    return res.status(201).json({
      message: "Lecture created successfully! 🎉",
      lecture,
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseLectures = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate("lectures");
    if (!course) {
      throw new CustomError("Course not found", 404);
    }
    return res.status(200).json({ lectures: course.lectures });
  } catch (error) {
    next(error);
  }
};

export const editLecture = async (req, res, next) => {
  try {
    const { lectureTitle, videoInfo, isPreviewFree } = req.body;
    const { lectureId, courseId } = req.params;

    // 1. Validate inputs
    if (!lectureId || !courseId) {
      throw new CustomError("Missing required parameters", 400);
    }

    // 2. Find existing lecture
    const existingLecture = await Lecture.findById(lectureId);
    if (!existingLecture) {
      throw new CustomError("Lecture not found", 404);
    }

    // 3. Get video URL from request body
    const newVideoUrl = videoInfo?.videoUrl;

    // 4. Delete old video from MinIO ONLY if new video URL is provided
    if (existingLecture.videoUrl && newVideoUrl) {
      // Extract filename from existingLecture.videoUrl
      const oldVideoFilename = existingLecture.videoUrl
        .split("/")
        .pop()
        .split("?")[0]; // Consider only the part before '?'
      await deleteVideoFromMinio(oldVideoFilename);
    }

    // 5. Update lecture with single query
    const updatedLecture = await Lecture.findByIdAndUpdate(
      lectureId,
      {
        ...(lectureTitle && { lectureTitle }),
        ...(newVideoUrl && { videoUrl: newVideoUrl }),
        ...(typeof isPreviewFree !== "undefined" && { isPreviewFree }),
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Lecture updated successfully! 🎉",
      lecture: updatedLecture,
    });
  } catch (error) {
    next(error);
  }
};

export const removeLecture = async (req, res, next) => {
  try {
    const { lectureId } = req.params;

    // 1. Find and delete lecture in one query
    const deletedLecture = await Lecture.findByIdAndDelete(lectureId);
    if (!deletedLecture) {
      throw new CustomError("Lecture not found", 404);
    }

    // 2. Run cleanup operations in parallel
    await Promise.all([
      // Delete video from MinIO if exists
      deletedLecture.videoUrl &&
        deleteVideoFromMinio(
          deletedLecture.videoUrl.split("/").pop().split("?")[0]
        ),
      // Remove lecture reference from course
      Course.updateOne(
        { lectures: lectureId },
        { $pull: { lectures: lectureId } }
      ),
    ]);

    return res.status(200).json({
      success: true,
      message: "Lecture deleted successfully! 🎉",
    });
  } catch (error) {
    next(error);
  }
};

export const getLectureById = async (req, res, next) => {
  try {
    const { lectureId } = req.params;

    // 1. Find lecture and select needed fields
    const lecture = await Lecture.findById(lectureId).select(
      "lectureTitle videoUrl isPreviewFree"
    );

    if (!lecture) {
      throw new CustomError("Lecture not found", 404);
    }

    return res.status(200).json({
      success: true,
      lecture,
    });
  } catch (error) {
    next(error);
  }
};
