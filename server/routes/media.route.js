import express from "express";
import upload from "../utils/multer.js";
import { uploadVideoToMinio } from "../utils/minio.js";
import fs from "fs";

const router = express.Router();

router
  .route("/upload-video")
  .post(upload.single("file"), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded.",
        });
      }

      // check file type
      if (!req.file.mimetype.startsWith("video/")) {
        return res.status(400).json({
          success: false,
          message: "Only video files are allowed.",
        });
      }
      // Upload video to MinIO
      const result = await uploadVideoToMinio(req.file.path, req.file.filename);

      // delete temporary file after uploading
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error("Error deleting temporary file:", err);
        }
      });

      return res.status(201).json({
        success: true,
        message: "Video uploaded successfully! 🎉",
        data: {
          url: result.url, // URL to access the video
        },
      });
    } catch (error) {
      // delete temporary file if an error occurs
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error("Error deleting temporary file:", err);
          }
        });
      }
      next(error);
    }
  });

export default router;
