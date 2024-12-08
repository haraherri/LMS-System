import express from "express";
import upload from "../utils/multer.js";
import { CustomError } from "../middlewares/error.js";
import { uploadMedia } from "../utils/cloudinary.js";

const router = express.Router();

router
  .route("/upload-video")
  .post(upload.single("file"), async (req, res, next) => {
    try {
      const result = await uploadMedia(req.file.path);
      return res.status(201).json({
        success: true,
        message: "Video uploaded successfully! 🎉",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  });

export default router;
