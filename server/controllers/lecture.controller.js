import { CustomError } from "../middlewares/error.js";
import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { Section } from "../models/section.model.js";
import { deleteVideoFromMinio } from "../utils/minio.js";
import minioClient from "../utils/minio.js";

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

    // 3. Prepare updated data
    let updateData = {
      ...(lectureTitle && { lectureTitle }),
      ...(typeof isPreviewFree !== "undefined" && { isPreviewFree }),
    };

    // 4. Update video information if provided
    if (videoInfo && videoInfo.videoFilename) {
      updateData.videoUrl = videoInfo.url;
      updateData.videoFilename = videoInfo.videoFilename;
      updateData.videoUrlExpiresAt = videoInfo.expires;

      // Delete the old video from MinIO (if it exists and the filename is different)
      if (
        existingLecture.videoFilename &&
        existingLecture.videoFilename !== videoInfo.videoFilename
      ) {
        await deleteVideoFromMinio(existingLecture.videoFilename);
      }
    }

    // 5. Update lecture with single query
    const updatedLecture = await Lecture.findByIdAndUpdate(
      lectureId,
      updateData,
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

// Hàm hỗ trợ để lấy thông tin bài giảng và làm mới URL nếu cần
const getLectureAndRefreshUrl = async (lectureId) => {
  const lecture = await Lecture.findById(lectureId);
  if (!lecture) {
    throw new CustomError("Lecture not found", 404);
  }

  // Kiểm tra nếu URL sắp hết hạn (ví dụ: dưới 24 giờ) và tồn tại videoFilename
  const now = new Date();
  const twentyFourHoursFromNow = new Date(now);
  twentyFourHoursFromNow.setHours(twentyFourHoursFromNow.getHours() + 24);

  if (
    lecture.videoFilename && // Check if videoFilename exists
    (!lecture.videoUrl ||
      (lecture.videoUrlExpiresAt &&
        lecture.videoUrlExpiresAt < twentyFourHoursFromNow))
  ) {
    // Tạo mới presigned URL với hạn 7 ngày
    const url = await minioClient.presignedGetObject(
      process.env.MINIO_BUCKET_NAME,
      lecture.videoFilename,
      7 * 24 * 60 * 60
    );

    // Cập nhật thời gian hết hạn mới
    const expires = new Date();
    expires.setSeconds(expires.getSeconds() + 7 * 24 * 60 * 60);

    // Cập nhật thông tin video trong database
    lecture.videoUrl = url;
    lecture.videoUrlExpiresAt = expires;
    await lecture.save();
  }

  return lecture;
};

export const removeLecture = async (req, res, next) => {
  try {
    const { lectureId } = req.params;

    const lectureToDelete = await Lecture.findById(lectureId);
    if (!lectureToDelete) {
      throw new CustomError("Lecture not found", 404);
    }
    const section = await Section.findOne({ lectures: lectureId });

    if (!section) {
      throw new CustomError("Section not found or lecture not in section", 404);
    }

    section.lectures = section.lectures.filter(
      (id) => id.toString() !== lectureId
    );
    await section.save();

    await Lecture.findByIdAndDelete(lectureId);

    // Delete video from MinIO if exists
    if (lectureToDelete.videoFilename) {
      await deleteVideoFromMinio(lectureToDelete.videoFilename);
    }

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
    const lecture = await getLectureAndRefreshUrl(lectureId);
    return res.status(200).json({
      success: true,
      lecture,
    });
  } catch (error) {
    next(error);
  }
};
