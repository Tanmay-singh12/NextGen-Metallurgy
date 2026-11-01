
import mongoose from "mongoose";
import Registration from "../models/Registration.js";

export const listRegistrations = async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 20)
    );

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim().slice(0, 100)
        : "";

    const filter = {};

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(escapedSearch, "i");

      filter.$or = [
        { name: searchRegex },
        { rollNumber: searchRegex },
        { registrationId: searchRegex },
        { email: searchRegex },
      ];
    }

    const [registrations, total] = await Promise.all([
      Registration.find(filter)
        .select(
          "registrationId name email mobileNumber rollNumber year department createdAt"
        )
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Registration.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: registrations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRegistrationDetails = async (req, res, next) => {
  try {
    const { registrationId } = req.params;

    if (
      typeof registrationId !== "string" ||
      !registrationId.trim() ||
      registrationId.length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid registration ID is required.",
      });
    }

    const registration = await Registration.findOne({
      registrationId: registrationId.trim().toUpperCase(),
    })
      .select(
        "registrationId name email mobileNumber rollNumber year department createdAt"
      )
      .lean();

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    next(error);
  }
};
