import { CustomError } from "../middlewares/error.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw new CustomError("All fields are required!", 400);
    }
    const user = await User.findOne({ email });
    if (user) {
      throw new CustomError("User already exists!", 400);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: hashedPassword,
    });
    return res.status(201).json({
      success: true,
      message: "User registered successfully!",
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new CustomError("Please provide email and password!", 400);
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError("Invalid credentials!", 401);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new CustomError("Invalid credentials!", 401);
    }
    generateToken(res, user, `Welcome back, ${user.name}!`);
  } catch (error) {
    next(error);
  }
};
