import multer from "multer";
import path from "path";
import { CustomError } from "../middlewares/error.js";

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  const allowedVideoTypes = [
    "video/mp4",
    "video/webm",
    "video/x-matroska", // Format for MKV
    "video/mkv",
  ];

  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else if (allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new CustomError("Unsupported file type", 400), false);
  }
};

// Configure multer (without limits)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  // limits: { // Remove this part to disable file size limit
  //   fileSize: 50 * 1024 * 1024, // 50MB max file size
  // },
});

export default upload;
