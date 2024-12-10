import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  createCheckoutSession,
  getAllPurchasedCourse,
  getCourseDetailWithPurchaseStatus,
  stripeWebhook,
} from "../controllers/coursePurchase.controller.js";

const router = express.Router();

router
  .route("/checkout/create-checkout-session")
  .post(verifyToken, createCheckoutSession);
router
  .route("/webhook")
  .post(express.raw({ type: "application/json" }), stripeWebhook);

router
  .route("/course/:courseId/detail-with-status")
  .get(verifyToken, getCourseDetailWithPurchaseStatus);

router.route("/").get(verifyToken, getAllPurchasedCourse);
export default router;
