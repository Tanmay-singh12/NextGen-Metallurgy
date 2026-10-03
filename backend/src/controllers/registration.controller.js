import {
  createRegistration,
  getRegistrationById,
} from "../services/registration.service.js";

import { validateRegistration } from "../validators/registration.validator.js";

import { generateConferenceTicket } from "../services/ticket.service.js";

export const register = async (req, res, next) => {
  try {
    const validationResult = validateRegistration(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    const registration = await createRegistration(
      validationResult.data
    );

    // Generate the conference ticket immediately
    // after successful registration.
    await generateConferenceTicket(registration);

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      data: {
        registrationId: registration.registrationId,
        name: registration.name,
        rollNumber: registration.rollNumber,
        year: registration.year,
        department: registration.department,
        createdAt: registration.createdAt,
        ticketAvailable: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRegistration = async (req, res, next) => {
  try {
    const { registrationId } = req.params;

    const registration = await getRegistrationById(
      registrationId
    );

    return res.status(200).json({
      success: true,
      message: "Registration fetched successfully.",
      data: {
        registrationId: registration.registrationId,
        name: registration.name,
        rollNumber: registration.rollNumber,
        year: registration.year,
        department: registration.department,
        createdAt: registration.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const downloadTicket = async (req, res, next) => {
  try {
    const { registrationId } = req.params;

    const registration = await getRegistrationById(
      registrationId
    );

    const ticketBuffer =
      await generateConferenceTicket(registration);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="conference-ticket-${registration.registrationId}.pdf"`,
      "Content-Length": ticketBuffer.length,
      "Cache-Control": "no-store",
    });

    return res.status(200).send(ticketBuffer);
  } catch (error) {
    next(error);
  }
};