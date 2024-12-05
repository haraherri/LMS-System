import express from "express";
import {
  getUserProfile,
  login,
  logout,
  register,
  updateProfile,
} from "../controllers/user.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/profile").get(verifyToken, getUserProfile);
router
  .route("/profile/update")
  .put(verifyToken, upload.single("profilePhoto"), updateProfile);
export default router;
