
import AbstractSubmission from "../models/AbstractSubmission.js";
import {
  getAbstractByRegistrationId,
  getAbstractFile,
  getContributorPhoto,
  getPaymentScreenshot,
} from "../services/abstract.service.js";

const normalizeRegistrationId = (value) =>
  typeof value === "string" ? value.trim().toUpperCase() : "";

const safeFilename = (value, fallback) => {
  const name = String(value || fallback)
    .replace(/[\r\n"]/g, "")
    .replace(/[\\/]/g, "_")
    .slice(0, 180);

  return name || fallback;
};


const normalizeFileBuffer = (data) => {
  if (Buffer.isBuffer(data)) {
    return data;
  }

  if (data instanceof Uint8Array) {
    return Buffer.from(data);
  }

  // Handle serialized Node.js Buffer objects.
  if (data?.type === "Buffer" && Array.isArray(data.data)) {
    return Buffer.from(data.data);
  }

  // Handle MongoDB BSON Binary objects.
  if (data?.buffer instanceof Uint8Array) {
    const length = Number.isInteger(data.position)
      ? data.position
      : data.buffer.length;

    return Buffer.from(data.buffer.subarray(0, length));
  }

  if (Array.isArray(data)) {
    return Buffer.from(data);
  }

  throw new Error("Unsupported file data format.");
};

const sendFile = (res, file, fallback, inline = false) => {
  if (!file?.data) {
    return res.status(404).json({
      success: false,
      message: "File not found.",
    });
  }

  let fileBuffer;

  try {
    fileBuffer = normalizeFileBuffer(file.data);
  } catch (error) {
    console.error("File buffer conversion failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process the uploaded file.",
    });
  }

  const filename = safeFilename(file.originalName, fallback);
  const mimeType = String(
    file.mimeType || "application/octet-stream"
  ).toLowerCase();

  const allowedInlineTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (inline && !allowedInlineTypes.includes(mimeType)) {
    return res.status(415).json({
      success: false,
      message: "This file type cannot be displayed inline.",
    });
  }

  res.set({
    "Content-Type": mimeType,
    "Content-Disposition": `${
      inline ? "inline" : "attachment"
    }; filename="${filename}"`,
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "private, no-store",
  });

  if (inline) {
    res.set("Content-Security-Policy", "sandbox");
  }

  // Express handles the response length automatically.
  // Do not manually set Content-Length here.
  return res.status(200).send(fileBuffer);
};


export const listAbstractSubmissions = async (req, res, next) => {
  try {
    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 20)
    );

    const filter = {};

    if (typeof req.query.status === "string" && req.query.status.trim()) {
      const status = req.query.status.trim().toUpperCase();

      if (!["UNDER_REVIEW", "APPROVED", "REJECTED"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid abstract status.",
        });
      }

      filter.status = status;
    }

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim().slice(0, 100)
        : "";

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");

      filter.$or = [
        { registrationId: regex },
        { contributorNames: regex },
        { abstractTitle: regex },
        { mentorName: regex },
        { organizationName: regex },
        { theme: regex },
      ];
    }

    const [submissions, total] = await Promise.all([
      AbstractSubmission.find(filter)
        .select(
          "-photos.data -abstractFile.data -paymentScreenshot.data"
        )
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AbstractSubmission.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAbstractDetails = async (req, res, next) => {
  try {
    const registrationId = normalizeRegistrationId(
      req.params.registrationId
    );

    if (!registrationId || registrationId.length > 100) {
      return res.status(400).json({
        success: false,
        message: "A valid registration ID is required.",
      });
    }

    const submission = await getAbstractByRegistrationId(registrationId);

    return res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadAbstractFile = async (req, res, next) => {
  try {
    const registrationId = normalizeRegistrationId(
      req.params.registrationId
    );

    if (!registrationId || registrationId.length > 100) {
      return res.status(400).json({
        success: false,
        message: "A valid registration ID is required.",
      });
    }

    const file = await getAbstractFile(registrationId);

    return sendFile(res, file, "abstract.docx");
  } catch (error) {
    next(error);
  }
};

export const downloadContributorPhoto = async (req, res, next) => {
  try {
    const registrationId = normalizeRegistrationId(
      req.params.registrationId
    );

    if (!registrationId || registrationId.length > 100) {
      return res.status(400).json({
        success: false,
        message: "A valid registration ID is required.",
      });
    }

    const photoIndex = Number(req.params.photoIndex);

    if (
      !Number.isInteger(photoIndex) ||
      photoIndex < 0 ||
      photoIndex > 4
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid photo index.",
      });
    }

    const photo = await getContributorPhoto(
      registrationId,
      photoIndex
    );

    if (!photo.mimeType?.startsWith("image/")) {
      return res.status(415).json({
        success: false,
        message: "Unsupported photo type.",
      });
    }

    return sendFile(res, photo, "contributor-photo", "inline");
  } catch (error) {
    next(error);
  }
};

export const downloadPaymentScreenshot = async (req, res, next) => {
  try {
    const registrationId = normalizeRegistrationId(
      req.params.registrationId
    );

    if (!registrationId || registrationId.length > 100) {
      return res.status(400).json({
        success: false,
        message: "A valid registration ID is required.",
      });
    }

    const file = await getPaymentScreenshot(registrationId);

    if (!file.mimeType?.startsWith("image/")) {
      return res.status(415).json({
        success: false,
        message: "Unsupported payment screenshot type.",
      });
    }

    return sendFile(res, file, "payment-screenshot", "inline");
  } catch (error) {
    next(error);
  }
};
