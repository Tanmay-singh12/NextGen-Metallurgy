
import express from "express";

import {
  checkInAttendee,
  listAttendance,
   getAttendanceStats,
} from "../controllers/admin-attendance.controller.js";

import adminAuthMiddleware from "../middleware/admin-auth.middleware.js";
import requireAdminRole from "../middleware/admin-role.middleware.js";

const router = express.Router();

// All attendance endpoints require an authenticated admin.
router.use(
  adminAuthMiddleware,
  requireAdminRole("ADMIN", "SUPER_ADMIN")
);

router.post("/check-in", checkInAttendee);
router.get("/stats", getAttendanceStats);
router.get("/", listAttendance);

export default router;
