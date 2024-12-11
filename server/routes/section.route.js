import express from "express";

import {
  createSection,
  deleteSection,
  getCourseSections,
  updateSection,
} from "../controllers/section.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/:courseId", verifyToken, createSection);
router.get("/course/:courseId", getCourseSections);
router.put("/:sectionId", verifyToken, updateSection);
router.delete("/:sectionId", verifyToken, deleteSection);

export default router;
