import { CustomError } from "../middlewares/error.js";
import { Section } from "../models/section.model.js";
import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { deleteVideoFromMinio } from "../utils/minio.js";

export const createSection = async (req, res, next) => {
  try {
    const { sectionTitle } = req.body;
    const { courseId } = req.params;

    if (!sectionTitle || !courseId) {
      throw new CustomError("Please provide all required fields", 400);
    }

    const section = await Section.create({
      sectionTitle,
      course: courseId,
    });

    // Add section to course
    const course = await Course.findById(courseId);
    if (!course) {
      throw new CustomError("Course not found", 404);
    }
    course.sections.push(section._id);
    await course.save();

    return res.status(201).json({
      message: "Section created successfully! 🎉",
      section,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSection = async (req, res, next) => {
  try {
    const { sectionId } = req.params;

    const sectionToDelete = await Section.findById(sectionId);
    if (!sectionToDelete) {
      throw new CustomError("Section not found", 404);
    }

    const courseId = sectionToDelete.course;

    const lecturesToDelete = await Lecture.find({
      _id: { $in: sectionToDelete.lectures },
    });
    await Promise.all(
      lecturesToDelete.map(async (lecture) => {
        if (lecture.videoUrl) {
          const videoFilename = lecture.videoUrl.split("/").pop().split("?")[0];
          await deleteVideoFromMinio(videoFilename);
        }
      })
    );

    await Lecture.deleteMany({ _id: { $in: sectionToDelete.lectures } });

    await Course.findByIdAndUpdate(
      courseId,
      { $pull: { sections: sectionId } },
      { new: true }
    );

    await Section.findByIdAndDelete(sectionId);

    return res.status(200).json({
      success: true,
      message: "Section and associated lectures deleted successfully! 🎉",
    });
  } catch (error) {
    next(error);
  }
};

export const updateSection = async (req, res, next) => {
  try {
    const { sectionId } = req.params;
    const { sectionTitle } = req.body;

    if (!sectionTitle) {
      throw new CustomError("Section title is required", 400);
    }

    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { sectionTitle },
      { new: true, runValidators: true }
    );

    if (!updatedSection) {
      throw new CustomError("Section not found", 404);
    }

    return res.status(200).json({
      success: true,
      message: "Section updated successfully! 🎉",
      section: updatedSection,
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseSections = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate({
      path: "sections",
      populate: { path: "lectures" }, // Populate lectures trong mỗi section
    });

    if (!course) {
      throw new CustomError("Course not found", 404);
    }

    return res.status(200).json({
      sections: course.sections,
    });
  } catch (error) {
    next(error);
  }
};
