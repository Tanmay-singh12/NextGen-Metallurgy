
import Registration from "../models/Registration.js";
import AbstractSubmission from "../models/AbstractSubmission.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalRegistrations,
      totalAbstracts,
      underReview,
      approved,
      rejected,
    ] = await Promise.all([
      Registration.countDocuments(),
      AbstractSubmission.countDocuments(),
      AbstractSubmission.countDocuments({
        status: "UNDER_REVIEW",
      }),
      AbstractSubmission.countDocuments({
        status: "APPROVED",
      }),
      AbstractSubmission.countDocuments({
        status: "REJECTED",
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalRegistrations,
        totalAbstracts,
        abstracts: {
          underReview,
          approved,
          rejected,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
