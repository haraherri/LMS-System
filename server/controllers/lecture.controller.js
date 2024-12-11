import { CustomError } from "../middlewares/error.js";
import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { Section } from "../models/section.model.js";
import { deleteVideoFromMinio, uploadVideoToMinio } from "../utils/minio.js";

export const createLecture = async (req, res, next) => {
  try {
    const { lectureTitle, sectionId } = req.body; // Lấy thêm sectionId từ request body

    if (!lectureTitle || !sectionId) {
      throw new CustomError("Please provide all required fields", 400);
    }

    const lecture = await Lecture.create({ lectureTitle });

    // Add lecture to section instead of course
    const section = await Section.findById(sectionId);
    if (!section) {
      throw new CustomError("Section not found", 404);
    }
    section.lectures.push(lecture._id);
    await section.save();

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

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      throw new CustomError("Course not found", 404);
    }

    // Get all sections of the course
    const sections = await Section.find({ course: courseId }).populate(
      "lectures"
    );

    // Extract all lectures from the sections
    const lectures = sections.reduce(
      (acc, section) => acc.concat(section.lectures),
      []
    );

    return res.status(200).json({ lectures });
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
    const { lectureId, courseId } = req.params;

    const lectureToDelete = await Lecture.findById(lectureId);
    if (!lectureToDelete) {
      throw new CustomError("Lecture not found", 404);
    }
    const section = await Section.findOne({ lectures: lectureId });

    if (!section) {
      throw new CustomError("Section not found or lecture not in section", 404);
    }
    const sectionId = section._id;

    section.lectures = section.lectures.filter(
      (id) => id.toString() !== lectureId
    );
    await section.save();

    await Lecture.findByIdAndDelete(lectureId);

    await Promise.all([
      // Delete video from MinIO if exists
      lectureToDelete.videoUrl &&
        deleteVideoFromMinio(
          lectureToDelete.videoUrl.split("/").pop().split("?")[0]
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
