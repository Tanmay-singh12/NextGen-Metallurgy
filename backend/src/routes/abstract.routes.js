import express from "express";

import {
  submitAbstract,
  getAbstractStatus,
  downloadAbstractFile,
  viewContributorPhoto,
  downloadPaymentScreenshot,
} from "../controllers/abstract.controller.js";

import {
  abstractUploads,
  validateUploadedFiles,
} from "../middleware/upload.middleware.js";

const router = express.Router();

router.post(
  "/",
  abstractUploads,
  (req, res, next) => {
    try {
      validateUploadedFiles(req.files);
      next();
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  },
  submitAbstract
);

router.get("/status/:registrationId", getAbstractStatus);

router.get(
  "/:registrationId/files/abstract",
  downloadAbstractFile
);

router.get(
  "/:registrationId/files/photo/:photoIndex",
  viewContributorPhoto
);

router.get(
  "/:registrationId/files/payment-screenshot",
  downloadPaymentScreenshot
);

export default router;