
import express from "express";
import {
  listRegistrations,
  getRegistrationDetails,
} from "../controllers/admin-registration.controller.js";
import adminAuthMiddleware from "../middleware/admin-auth.middleware.js";
import requireAdminRole from "../middleware/admin-role.middleware.js";

const router = express.Router();

router.use(
  adminAuthMiddleware,
  requireAdminRole("ADMIN", "SUPER_ADMIN")
);

router.get("/", listRegistrations);
router.get("/:registrationId", getRegistrationDetails);

export default router;
