// models/lecture.model.js
import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    lectureTitle: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
    },
    videoFilename: {
      type: String,
    },
    videoUrlExpiresAt: {
      type: Date,
    },
    isPreviewFree: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Lecture = mongoose.model("Lecture", lectureSchema);
