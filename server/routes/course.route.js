import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { createCourse } from "../controllers/course.controller.js";
const router = express.Router();

router.route("/").post(verifyToken, createCourse); //create a new course
export default router;
