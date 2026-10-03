import {
  createAbstractSubmission,
  getAbstractByRegistrationId,
  getAbstractFile,
  getContributorPhoto,
  getPaymentScreenshot,
} from "../services/abstract.service.js";

import { validateAbstractSubmission } from "../validators/abstract.validator.js";

export const submitAbstract = async (req, res, next) => {
    try {
        const body = {
            ...req.body,
        };

        // Multipart/form-data sends keywords as a string.
        // Convert it into the array expected by the validator.
        if (typeof body.keywords === "string") {
            try {
                body.keywords = JSON.parse(body.keywords);
            } catch {
                body.keywords = body.keywords
                    .replace(/^\[|\]$/g, "")
                    .split(",")
                    .map((keyword) => keyword.trim())
                    .filter(Boolean);
            }
        }

        const validationResult =
            validateAbstractSubmission(body);

        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: validationResult.error.flatten().fieldErrors,
            });
        }

        const files = {
            photos: req.files?.photo || [],
            abstractFile: req.files?.abstractFile?.[0] || null,
            paymentScreenshot:
                req.files?.paymentScreenshot?.[0] || null,
        };

        const submission = await createAbstractSubmission(
            validationResult.data,
            files
        );

        return res.status(201).json({
            success: true,
            message: "Your abstract is under review.",
            data: {
                abstractId: submission._id,
                registrationId: submission.registrationId,
                abstractTitle: submission.abstractTitle,
                status: submission.status,
                createdAt: submission.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getAbstractStatus = async (
    req,
    res,
    next
) => {
    try {
        const { registrationId } = req.params;

        const submission =
            await getAbstractByRegistrationId(
                registrationId
            );

        return res.status(200).json({
            success: true,
            message:
                "Abstract status fetched successfully.",
            data: {
                abstractId: submission._id,
                registrationId:
                    submission.registrationId,
                abstractTitle:
                    submission.abstractTitle,
                status: submission.status,
                rejectionReason:
                    submission.rejectionReason,
                createdAt: submission.createdAt,
                reviewedAt: submission.reviewedAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const downloadAbstractFile = async (
  req,
  res,
  next
) => {
  try {
    const { registrationId } = req.params;

    const file = await getAbstractFile(
      registrationId
    );

    res.set({
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(
        file.originalName
      )}"`,
      "Content-Length": file.data.length,
      "Cache-Control": "no-store",
    });

    return res.status(200).send(file.data);
  } catch (error) {
    next(error);
  }
};

export const viewContributorPhoto = async (
  req,
  res,
  next
) => {
  try {
    const { registrationId, photoIndex } =
      req.params;

    const photo = await getContributorPhoto(
      registrationId,
      photoIndex
    );

    res.set({
      "Content-Type": photo.mimeType,
      "Content-Length": photo.data.length,
      "Cache-Control": "no-store",
    });

    return res.status(200).send(photo.data);
  } catch (error) {
    next(error);
  }
};

export const downloadPaymentScreenshot = async (
  req,
  res,
  next
) => {
  try {
    const { registrationId } = req.params;

    const file = await getPaymentScreenshot(
      registrationId
    );

    res.set({
      "Content-Type": file.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(
        file.originalName
      )}"`,
      "Content-Length": file.data.length,
      "Cache-Control": "no-store",
    });

    return res.status(200).send(file.data);
  } catch (error) {
    next(error);
  }
};