
import express from "express";
import { getDashboardStats } from "../controllers/admin-dashboard.controller.js";
import adminAuthMiddleware from "../middleware/admin-auth.middleware.js";
import requireAdminRole from "../middleware/admin-role.middleware.js";

const router = express.Router();

router.get(
  "/stats",
  adminAuthMiddleware,
  requireAdminRole("ADMIN", "SUPER_ADMIN"),
  getDashboardStats
);

export default router;
