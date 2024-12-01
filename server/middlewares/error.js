import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const formatDate = (date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${formattedHours}:${formattedMinutes} ${ampm} ${day}/${month}/${year}`;
};

const logError = async (err) => {
  const now = new Date();
  const timestamp = formatDate(now);
  const logMessage = `${timestamp} - ${err.name}: ${err.message}\n${err.stack}\n\n`;

  // Create logs directory
  const logsDir = path.join(rootDir, "logs");
  await fs.mkdir(logsDir, { recursive: true });

  // Create daily log file
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;
  const logFilePath = path.join(logsDir, `error-${dateStr}.log`);

  try {
    await fs.appendFile(logFilePath, logMessage);
    console.log("Error logged to file successfully");
  } catch (appendErr) {
    console.error("Failed to write to log file:", appendErr);
  }
};

const errorHandler = (err, req, res, next) => {
  // Log to file
  logError(err);

  // Log to console - single consolidated message
  console.error("\x1b[31m%s\x1b[0m", "🔥 Error:", err.message);
  console.error(err.stack);

  if (err instanceof CustomError) {
    return res.status(err.status).json({
      success: false,
      error: err.message,
    });
  }
  return res.status(500).json({
    success: false,
    error: "Internal Server Error!",
  });
};

class CustomError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

export { errorHandler, CustomError };
