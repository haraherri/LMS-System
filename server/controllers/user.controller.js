import { CustomError } from "../middlewares/error.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

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

export const logout = async (req, res, next) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 0,
    });
    return res.status(200).json({
      success: true,
      message: "Logged out successfully!",
    });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new CustomError("User not found!", 404);
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.id;
    const { name } = req.body;

    if (!req.file) {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { name },
        { new: true }
      ).select("-password");

      return res.status(200).json({
        success: true,
        user: updatedUser,
        message: "Profile updated successfully!",
      });
    }

    // if there is a file
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User not found!", 404);
    }

    // remove old photo
    if (user.photoUrl) {
      const publicId = user.photoUrl.split("/").pop().split(".")[0];
      await deleteMediaFromCloudinary(publicId);
    }

    // upload new photo
    const cloudResponse = await uploadMedia(req.file.path);
    if (!cloudResponse) {
      throw new CustomError("Error uploading image", 500);
    }

    // upload user with new photo
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        photoUrl: cloudResponse.secure_url,
      },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully!",
    });
  } catch (error) {
    next(error);
  }
};
