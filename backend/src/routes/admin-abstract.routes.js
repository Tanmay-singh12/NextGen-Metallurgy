
import express from "express";
import {
  listAbstractSubmissions,
  getAbstractDetails,
  downloadAbstractFile,
  downloadContributorPhoto,
  downloadPaymentScreenshot,
} from "../controllers/admin-abstract.controller.js";
import adminAuthMiddleware from "../middleware/admin-auth.middleware.js";
import requireAdminRole from "../middleware/admin-role.middleware.js";

const router = express.Router();

router.use(
  adminAuthMiddleware,
  requireAdminRole("ADMIN", "SUPER_ADMIN")
);

router.get("/", listAbstractSubmissions);

router.get(
  "/:registrationId/file",
  downloadAbstractFile
);

router.get(
  "/:registrationId/photos/:photoIndex",
  downloadContributorPhoto
);

router.get(
  "/:registrationId/payment-screenshot",
  downloadPaymentScreenshot
);

router.get(
  "/:registrationId",
  getAbstractDetails
);

export default router;
