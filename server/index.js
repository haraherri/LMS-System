import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import { errorHandler } from "./middlewares/error.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import uploadRoutes from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgessRoute from "./routes/courseProgress.route.js";
import sectionRoutes from "./routes/section.route.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;

app.use("/api/v1/purchase/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/courses", courseRoute);
app.use("/api/v1", uploadRoutes);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgessRoute);
app.use("/api/v1/sections", sectionRoutes);

(async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Backend server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
})();

app.use(errorHandler);
