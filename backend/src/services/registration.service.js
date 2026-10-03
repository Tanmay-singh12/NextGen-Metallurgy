import crypto from "crypto";

import Registration from "../models/Registration.js";
import AbstractSubmission from "../models/AbstractSubmission.js";

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

export const getRegistrationByRollNumber = async (
  rollNumber
) => {
  const normalizedRollNumber =
    rollNumber?.trim().toUpperCase();

  if (!normalizedRollNumber) {
    const error = new Error(
      "Roll number is required."
    );

    error.statusCode = 400;

    throw error;
  }

  const registration = await Registration.findOne({
    rollNumber: normalizedRollNumber,
  })
    .select(
      "registrationId name rollNumber year department createdAt"
    )
    .lean();

  if (!registration) {
    const error = new Error(
      "No registration found for this roll number."
    );

    error.statusCode = 404;

    throw error;
  }

  return registration;
};

export const getRegistrationStatusByRollNumber = async (
  rollNumber
) => {
  const normalizedRollNumber =
    rollNumber?.trim().toUpperCase();

  if (!normalizedRollNumber) {
    const error = new Error(
      "Roll number is required."
    );

    error.statusCode = 400;

    throw error;
  }

  const registration = await Registration.findOne({
    rollNumber: normalizedRollNumber,
  })
    .select(
      "registrationId name rollNumber year department createdAt"
    )
    .lean();

  if (!registration) {
    const error = new Error(
      "No registration found for this roll number."
    );

    error.statusCode = 404;

    throw error;
  }

  const abstractSubmission =
    await AbstractSubmission.findOne({
      registrationId: registration.registrationId,
    })
      .select(
        "abstractTitle status rejectionReason createdAt reviewedAt"
      )
      .lean();

  return {
    registration: {
      registrationId: registration.registrationId,
      name: registration.name,
      rollNumber: registration.rollNumber,
      year: registration.year,
      department: registration.department,
      createdAt: registration.createdAt,
    },

    abstract: abstractSubmission
      ? {
          submitted: true,
          abstractTitle:
            abstractSubmission.abstractTitle,
          status: abstractSubmission.status,
          rejectionReason:
            abstractSubmission.rejectionReason,
          createdAt:
            abstractSubmission.createdAt,
          reviewedAt:
            abstractSubmission.reviewedAt,
        }
      : {
          submitted: false,
          abstractTitle: null,
          status: null,
          rejectionReason: null,
          createdAt: null,
          reviewedAt: null,
        },
  };
};