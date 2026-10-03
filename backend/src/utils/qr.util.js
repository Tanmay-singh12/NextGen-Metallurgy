import QRCode from "qrcode";

/**
 * Generate a QR code as a PNG buffer.
 *
 * The QR contains only the unique registration ID.
 *
 * @param {string} registrationId
 * @returns {Promise<Buffer>}
 */
export const generateRegistrationQR = async (registrationId) => {
  if (!registrationId) {
    throw new Error("Registration ID is required");
  }

  return QRCode.toBuffer(registrationId, {
    type: "png",
    width: 500,
    margin: 2,
    errorCorrectionLevel: "H",
  });
};