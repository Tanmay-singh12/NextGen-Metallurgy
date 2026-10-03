import express from "express";

import {
  register,
  getRegistration,
  downloadTicket,
  getRegistrationByRoll,
  getRegistrationStatusByRoll,
} from "../controllers/registration.controller.js";

const router = express.Router();

router.post("/", register);

router.get(
  "/by-roll/:rollNumber",
  getRegistrationByRoll
);

router.get(
  "/status/:rollNumber",
  getRegistrationStatusByRoll
);

router.get("/:registrationId", getRegistration);

router.get("/:registrationId/ticket", downloadTicket);

export default router;