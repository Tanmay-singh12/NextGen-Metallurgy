import PDFDocument from "pdfkit";
import { generateRegistrationQR } from "../utils/qr.util.js";

/**
 * Generate a conference ticket PDF.
 *
 * @param {Object} registration
 * @returns {Promise<Buffer>}
 */
export const generateConferenceTicket = async (registration) => {
  if (!registration?.registrationId) {
    throw new Error("Registration ID is required");
  }

  const registrationId = registration.registrationId;

  const qrBuffer = await generateRegistrationQR(
    registrationId
  );

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: "Materials Symposium Ticket",
        Author: "COALESCENCE the Materials Symposium",
        Subject: "Symposium Registration Ticket",
      },
    });

    const chunks = [];

    doc.on("data", (chunk) => {
      chunks.push(chunk);
    });

    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    doc.on("error", reject);

    // Header
    doc
      .fontSize(11)
      .fillColor("#086c5e")
      .font("Helvetica-Bold")
      .text("COALESCENCE · MME 2026", {
        align: "center",
      });

    doc.moveDown(0.5);

    doc
      .fontSize(26)
      .fillColor("#102c27")
      .text("Symposium Ticket", {
        align: "center",
      });

    doc.moveDown(0.3);

    doc
      .fontSize(10)
      .fillColor("#666666")
      .font("Helvetica")
      .text("COALESCENCE THE MATERIALS SYMPOSIUM", {
        align: "center",
        characterSpacing: 1.2,
      });

    // Divider
    doc.moveDown(1);

    doc
      .moveTo(70, doc.y)
      .lineTo(525, doc.y)
      .strokeColor("#d7e2de")
      .stroke();

    doc.moveDown(1.5);

    // Attendee
    doc
      .fontSize(10)
      .fillColor("#777777")
      .font("Helvetica-Bold")
      .text("ATTENDEE");

    doc.moveDown(0.4);

    doc
      .fontSize(20)
      .fillColor("#102c27")
      .font("Helvetica-Bold")
      .text(registration.name || "N/A");

    doc.moveDown(1.2);

    const details = [
      ["Registration ID", registrationId],
      ["Roll Number", registration.rollNumber || "N/A"],
      ["Year of Study", registration.year || "N/A"],
      ["Department", registration.department || "N/A"],
    ];

    details.forEach(([label, value]) => {
      doc
        .fontSize(9)
        .fillColor("#777777")
        .font("Helvetica")
        .text(label);

      doc
        .fontSize(12)
        .fillColor("#102c27")
        .font("Helvetica-Bold")
        .text(value);

      doc.moveDown(0.7);
    });

    // QR code
    const qrX = 365;
    const qrY = 175;
    const qrSize = 135;

    doc.image(qrBuffer, qrX, qrY, {
      width: qrSize,
      height: qrSize,
    });

    doc
      .fontSize(8)
      .fillColor("#777777")
      .font("Helvetica")
      .text(
        "Scan to verify registration",
        qrX - 5,
        qrY + qrSize + 10,
        {
          width: qrSize + 10,
          align: "center",
        }
      );

    // Event information
    doc.moveDown(3);

    doc
      .roundedRect(70, doc.y, 455, 90, 8)
      .fillColor("#f1f7f5")
      .fill();

    const eventY = doc.y + 18;

    doc
      .fontSize(10)
      .fillColor("#086c5e")
      .font("Helvetica-Bold")
      .text("EVENT DETAILS", 90, eventY);

    doc
      .fontSize(11)
      .fillColor("#102c27")
      .font("Helvetica-Bold")
      .text(
        "Coalescence the Materials Symposium",
        90,
        eventY + 20
      );

    doc
      .fontSize(10)
      .fillColor("#555555")
      .font("Helvetica")
      .text(
        "16 — 18 October 2026",
        90,
        eventY + 40
      );

    doc
      .fontSize(9)
      .text(
        "Department of Metallurgical & Materials Engineering",
        90,
        eventY + 57
      );

    // Footer
    doc
      .fontSize(8)
      .fillColor("#888888")
      .text(
        "This ticket confirms your registration for the Symposium.",
        70,
        750,
        {
          width: 455,
          align: "center",
        }
      );

    doc
      .fontSize(8)
      .fillColor("#aaaaaa")
      .text(
        "Please present this ticket or its QR code at the registration desk.",
        70,
        765,
        {
          width: 455,
          align: "center",
        }
      );

    doc.end();
  });
};