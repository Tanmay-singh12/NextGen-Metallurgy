import express from "express";

import {
  register,
  getRegistration,
  downloadTicket,
} from "../controllers/registration.controller.js";

const router = express.Router();

router.post("/", register);

router.get("/:registrationId", getRegistration);

router.get("/:registrationId/ticket", downloadTicket);

export default router;