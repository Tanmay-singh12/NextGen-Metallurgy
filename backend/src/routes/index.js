import express from "express";

import registrationRoutes from "./registration.routes.js";
import abstractRoutes from "./abstract.routes.js";
import adminAuthRoutes from "./admin-auth.routes.js";
import adminDashboardRoutes from "./admin-dashboard.routes.js";
import adminRegistrationRoutes from "./admin-registration.routes.js";
import adminAbstractRoutes from "./admin-abstract.routes.js";
import adminAbstractReviewRoutes from "./admin-abstract-review.routes.js";
import adminAttendanceRoutes from "./admin-attendance.routes.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "NextGen Materials API is running",
    timestamp: new Date().toISOString(),
  });
});

router.use("/registrations", registrationRoutes);
router.use("/abstracts", abstractRoutes);
router.use("/admin/auth", adminAuthRoutes);
router.use("/admin/dashboard", adminDashboardRoutes);
router.use("/admin/registrations", adminRegistrationRoutes);
router.use("/admin/abstracts", adminAbstractRoutes);
router.use("/admin/abstract-review", adminAbstractReviewRoutes);
router.use("/admin/attendance", adminAttendanceRoutes);


export default router;