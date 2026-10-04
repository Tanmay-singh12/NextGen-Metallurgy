import AbstractSubmission from "../models/AbstractSubmission.js";
import Registration from "../models/Registration.js";

export const createAbstractSubmission = async (
    abstractData,
    files
) => {
    const {
        registrationId,
        contributorNames,
        abstractTitle,
        mentorName,
        organizationName,
        theme,
        keywords,
        transactionId,
    } = abstractData;

    const normalizedRegistrationId =
        registrationId.trim().toUpperCase();

    // Verify that the participant is registered
    const registration = await Registration.findOne({
        registrationId: normalizedRegistrationId,
    });

    if (!registration) {
        const error = new Error(
            "Valid symposium registration is required before submitting an abstract."
        );
        error.statusCode = 404;
        throw error;
    }

    // Prevent duplicate abstract submissions
    const existingSubmission =
        await AbstractSubmission.findOne({
            registrationId: normalizedRegistrationId,
        });

    if (existingSubmission) {
        const error = new Error(
            "An abstract has already been submitted for this registration."
        );
        error.statusCode = 409;
        throw error;
    }

    const photoFiles = files?.photos || [];
    const abstractFile = files?.abstractFile || null;
    const paymentScreenshot =
        files?.paymentScreenshot || null;

    // Abstract document is required
    if (!abstractFile) {
        const error = new Error(
            "Abstract file is required."
        );
        error.statusCode = 400;
        throw error;
    }

    // Payment screenshot is required
    if (!paymentScreenshot) {
        const error = new Error(
            "Payment screenshot is required."
        );
        error.statusCode = 400;
        throw error;
    }

    const abstractSubmission =
        await AbstractSubmission.create({
            registrationId: normalizedRegistrationId,

            contributorNames:
                contributorNames.trim(),

            abstractTitle:
                abstractTitle.trim(),

            mentorName:
                mentorName.trim(),

            organizationName:
                organizationName.trim(),

            theme,

            keywords: keywords.map((keyword) =>
                keyword.trim()
            ),

            transactionId:
                transactionId?.trim() || null,

            photos: photoFiles.map((file) => ({
                data: file.buffer,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
            })),

            abstractFile: {
                data: abstractFile.buffer,
                originalName: abstractFile.originalname,
                mimeType: abstractFile.mimetype,
                size: abstractFile.size,
            },

            paymentScreenshot: {
                data: paymentScreenshot.buffer,
                originalName: paymentScreenshot.originalname,
                mimeType: paymentScreenshot.mimetype,
                size: paymentScreenshot.size,
            },

            status: "UNDER_REVIEW",
        });

    return abstractSubmission;
};

export const getAbstractByRegistrationId = async (
    registrationId
) => {
    const normalizedRegistrationId =
        registrationId.trim().toUpperCase();

    const submission =
        await AbstractSubmission.findOne({
            registrationId: normalizedRegistrationId,
        })
            .select(
                "-photos.data -abstractFile.data -paymentScreenshot.data"
            )
            .lean();

    if (!submission) {
        const error = new Error(
            "No abstract submission found for this registration."
        );

        error.statusCode = 404;

        throw error;
    }

    return submission;
};

export const getAbstractFile = async (registrationId) => {
  const normalizedRegistrationId =
    registrationId.trim().toUpperCase();

  const submission = await AbstractSubmission.findOne({
    registrationId: normalizedRegistrationId,
  })
    .select("abstractFile")
    .lean();

  if (!submission) {
    const error = new Error(
      "No abstract submission found for this registration."
    );
    error.statusCode = 404;
    throw error;
  }

  if (!submission.abstractFile?.data) {
    const error = new Error(
      "Abstract file not found."
    );
    error.statusCode = 404;
    throw error;
  }

  return submission.abstractFile;
};

export const getContributorPhoto = async (
  registrationId,
  photoIndex
) => {
  const normalizedRegistrationId =
    registrationId.trim().toUpperCase();

  const index = Number(photoIndex);

  if (!Number.isInteger(index) || index < 0 || index > 4) {
    const error = new Error(
      "Invalid photo index."
    );
    error.statusCode = 400;
    throw error;
  }

  const submission = await AbstractSubmission.findOne({
    registrationId: normalizedRegistrationId,
  })
    .select("photos")
    .lean();

  if (!submission) {
    const error = new Error(
      "No abstract submission found for this registration."
    );
    error.statusCode = 404;
    throw error;
  }

  const photo = submission.photos?.[index];

  if (!photo?.data) {
    const error = new Error(
      "Contributor photo not found."
    );
    error.statusCode = 404;
    throw error;
  }

  return photo;
};

export const getPaymentScreenshot = async (
  registrationId
) => {
  const normalizedRegistrationId =
    registrationId.trim().toUpperCase();

  const submission = await AbstractSubmission.findOne({
    registrationId: normalizedRegistrationId,
  })
    .select("paymentScreenshot")
    .lean();

  if (!submission) {
    const error = new Error(
      "No abstract submission found for this registration."
    );
    error.statusCode = 404;
    throw error;
  }

  if (!submission.paymentScreenshot?.data) {
    const error = new Error(
      "Payment screenshot not found."
    );
    error.statusCode = 404;
    throw error;
  }

  return submission.paymentScreenshot;
};