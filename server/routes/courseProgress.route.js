import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  getCourseProgress,
  markAsCompleted,
  markAsInCompleted,
  updateLectureProgress,
} from "../controllers/courseProgress.controller.js";

const router = express.Router();

router.route("/:courseId").get(verifyToken, getCourseProgress); //get course progress
router
  .route("/:courseId/lecture/:lectureId/view")
  .patch(verifyToken, updateLectureProgress); //update lecture progress
router.route("/:courseId/complete").patch(verifyToken, markAsCompleted); //mark course as completed (changed from POST to PATCH)
router.route("/:courseId/incomplete").patch(verifyToken, markAsInCompleted); //reset course progress (changed from POST to PATCH)

export default router;
