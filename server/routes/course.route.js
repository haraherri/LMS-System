import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  createCourse,
  editCourse,
  getCourseById,
  getCreatorCourses,
} from "../controllers/course.controller.js";
import upload from "../utils/multer.js";
const router = express.Router();

router.route("/").post(verifyToken, createCourse); //create a new course
router.route("/").get(verifyToken, getCreatorCourses); //get all courses created by the user
router
  .route("/:courseId")
  .put(verifyToken, upload.single("courseThumbnail"), editCourse); //edit a course
router.route("/:courseId").get(verifyToken, getCourseById); //get a course by id

export default router;
