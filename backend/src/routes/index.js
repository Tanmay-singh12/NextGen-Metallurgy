import express from "express";

import registrationRoutes from "./registration.routes.js";
import abstractRoutes from "./abstract.routes.js";
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
export default router;