import mongoose from "mongoose";

const coursePurchaseSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Success", "Failed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export const CoursePurchase = mongoose.model(
  "CoursePurchase",
  coursePurchaseSchema
);
