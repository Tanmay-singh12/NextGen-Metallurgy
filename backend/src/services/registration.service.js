import crypto from "crypto";

import Registration from "../models/Registration.js";

const generateRegistrationId = async () => {
  let registrationId;
  let exists = true;

  while (exists) {
    const randomPart = crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase();

    registrationId = `NGM26-${randomPart}`;

    exists = await Registration.exists({
      registrationId,
    });
  }

  return registrationId;
};

export const createRegistration = async (registrationData) => {
  const { name, rollNumber, year, department } = registrationData;

  const normalizedRollNumber = rollNumber.trim().toUpperCase();

  const existingRegistration = await Registration.findOne({
    rollNumber: normalizedRollNumber,
  });

  if (existingRegistration) {
    const error = new Error(
      "A registration already exists for this roll number."
    );

    error.statusCode = 409;

    throw error;
  }

  const registrationId = await generateRegistrationId();

  try {
    const registration = await Registration.create({
      registrationId,
      name: name.trim(),
      rollNumber: normalizedRollNumber,
      year: year.trim(),
      department: department.trim(),
    });

    return registration;
  } catch (error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(
        error.keyPattern || {}
      )[0];

      if (duplicateField === "rollNumber") {
        const duplicateError = new Error(
          "A registration already exists for this roll number."
        );

        duplicateError.statusCode = 409;

        throw duplicateError;
      }

      if (duplicateField === "registrationId") {
        const duplicateError = new Error(
          "Unable to generate a unique registration ID. Please try again."
        );

        duplicateError.statusCode = 500;

        throw duplicateError;
      }
    }

    throw error;
  }
};

export const getRegistrationById = async (registrationId) => {
  const normalizedRegistrationId = registrationId
    ?.trim()
    .toUpperCase();

  if (!normalizedRegistrationId) {
    const error = new Error("Registration ID is required.");
    error.statusCode = 400;
    throw error;
  }

  const registration = await Registration.findOne({
    registrationId: normalizedRegistrationId,
  })
    .select("-_id -__v")
    .lean();

  if (!registration) {
    const error = new Error("Registration not found.");
    error.statusCode = 404;
    throw error;
  }

  return registration;
};