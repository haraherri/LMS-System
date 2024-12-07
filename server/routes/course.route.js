import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  createCourse,
  getCreatorCourses,
} from "../controllers/course.controller.js";
const router = express.Router();

router.route("/").post(verifyToken, createCourse); //create a new course
router.route("/").get(verifyToken, getCreatorCourses); //get all courses created by the user

export default router;
