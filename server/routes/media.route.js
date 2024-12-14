// routes/upload.js
import express from "express";
import upload from "../utils/multer.js";
import { uploadVideoToMinio } from "../utils/minio.js";
import fs from "fs";
import path from "path";

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

      // Generate a unique filename to avoid conflicts
      const uniqueFilename = `file-${Date.now()}${path.extname(
        req.file.originalname
      )}`;

      // Upload video to MinIO using the unique filename
      const result = await uploadVideoToMinio(req.file.path, uniqueFilename);

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
          url: result.url,
          expires: result.expires,
          videoFilename: result.videoFilename, // Include this
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
