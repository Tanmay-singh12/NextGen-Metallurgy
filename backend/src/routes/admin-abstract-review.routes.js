
import express from "express";
import {
  approveAbstract,
  rejectAbstract,
} from "../controllers/admin-abstract-review.controller.js";
import adminAuthMiddleware from "../middleware/admin-auth.middleware.js";
import requireAdminRole from "../middleware/admin-role.middleware.js";

const router = express.Router();

router.use(
  adminAuthMiddleware,
  requireAdminRole("ADMIN", "SUPER_ADMIN")
);

router.patch("/:registrationId/approve", approveAbstract);
router.patch("/:registrationId/reject", rejectAbstract);

export default router;
