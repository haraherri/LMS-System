import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  createCourse,
  editCourse,
  getCourseById,
  getCreatorCourses,
} from "../controllers/course.controller.js";
import upload from "../utils/multer.js";
import {
  createLecture,
  editLecture,
  getCourseLectures,
  getLectureById,
  removeLecture,
} from "../controllers/lecture.controller.js";
const router = express.Router();

router.route("/").post(verifyToken, createCourse); //create a new course
router.route("/").get(verifyToken, getCreatorCourses); //get all courses created by the user
router
  .route("/:courseId")
  .put(verifyToken, upload.single("courseThumbnail"), editCourse); //edit a course
router.route("/:courseId").get(verifyToken, getCourseById); //get a course by id
router.route("/:courseId/lecture").post(verifyToken, createLecture); //create a new lecture
router.route("/:courseId/lecture").get(verifyToken, getCourseLectures); // get all lectures of a course
router.route("/:courseId/lecture/:lectureId").patch(verifyToken, editLecture); //edit a lecture
router.route("/lecture/:lectureId").delete(verifyToken, removeLecture); //delete a lecture
router.route("/lecture/:lectureId").get(verifyToken, getLectureById); //get a lecture by id
export default router;
