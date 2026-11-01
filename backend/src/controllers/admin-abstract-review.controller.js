import AbstractSubmission from "../models/AbstractSubmission.js";

const normalizeRegistrationId = (value) =>
  typeof value === "string" ? value.trim().toUpperCase() : "";

const findSubmissionForReview = async (registrationId) => {
  return AbstractSubmission.findOne({
    registrationId,
    status: "UNDER_REVIEW",
  });
};

const updateReviewStatus = async (
  registrationId,
  status,
  rejectionReason = null,
) => {
  return AbstractSubmission.findOneAndUpdate(
    {
      registrationId,
      status: "UNDER_REVIEW",
    },
    {
      $set: {
        status,
        rejectionReason,
        reviewedAt: new Date(),
      },
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  )
    .select("-photos.data -abstractFile.data -paymentScreenshot.data")
    .lean();
};

const handleReviewError = async (res, registrationId) => {
  const exists = await AbstractSubmission.exists({ registrationId });

  if (!exists) {
    return res.status(404).json({
      success: false,
      message: "Abstract submission not found.",
    });
  }

  return res.status(409).json({
    success: false,
    message: "This abstract has already been reviewed.",
  });
};

export const approveAbstract = async (req, res, next) => {
  try {
    const registrationId = normalizeRegistrationId(req.params.registrationId);

    if (!registrationId || registrationId.length > 100) {
      return res.status(400).json({
        success: false,
        message: "A valid registration ID is required.",
      });
    }

    const submission = await updateReviewStatus(registrationId, "APPROVED");

    if (!submission) {
      return await handleReviewError(res, registrationId);
    }

    return res.status(200).json({
      success: true,
      message: "Abstract approved successfully.",
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectAbstract = async (req, res, next) => {
  try {
    const registrationId = normalizeRegistrationId(req.params.registrationId);

    if (!registrationId || registrationId.length > 100) {
      return res.status(400).json({
        success: false,
        message: "A valid registration ID is required.",
      });
    }

    const rejectionReason =
      typeof req.body?.rejectionReason === "string"
        ? req.body.rejectionReason.trim()
        : "";

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "A rejection reason is required.",
      });
    }

    if (rejectionReason.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason cannot exceed 1000 characters.",
      });
    }

    const submission = await updateReviewStatus(
      registrationId,
      "REJECTED",
      rejectionReason,
    );

    if (!submission) {
      return await handleReviewError(res, registrationId);
    }

    return res.status(200).json({
      success: true,
      message: "Abstract rejected successfully.",
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};
