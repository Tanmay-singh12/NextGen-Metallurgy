
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const adminLogin = async (req, res, next) => {
  try {
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const password =
      typeof req.body?.password === "string"
        ? req.body.password
        : "";

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    const admin = await Admin.findOne({ email }).select(
      "+passwordHash"
    );

    // Use the same response for unknown email and wrong password.
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      admin.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "This admin account is disabled.",
      });
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || "8h";

    const token = jwt.sign(
      {
        role: admin.role,
      },
      process.env.JWT_SECRET,
      {
        subject: admin._id.toString(),
        expiresIn,
        issuer: "nextgen-materials-api",
        audience: "nextgen-materials-admin",
      }
    );

    admin.lastLoginAt = new Date();
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      token,
      expiresIn,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
