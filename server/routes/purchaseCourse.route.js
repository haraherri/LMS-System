import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  createCheckoutSession,
  getAllPurchasedCourse,
  getCourseDetailWithPurchaseStatus,
  getPublicCourseDetail,
  getRevenueAnalytics,
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
router.route("/course/:courseId/public-detail").get(getPublicCourseDetail);
router.route("/analytics/revenue").get(verifyToken, getRevenueAnalytics);

router.route("/").get(verifyToken, getAllPurchasedCourse);

export default router;
