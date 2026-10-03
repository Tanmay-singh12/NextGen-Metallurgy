import multer from "multer";

const storage = multer.memoryStorage();

const MAX_ABSTRACT_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const MAX_PHOTO_TOTAL_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_PAYMENT_SCREENSHOT_SIZE = 5 * 1024 * 1024; // 5 MB

const imageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const wordMimeTypes = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "photo") {
    if (!imageMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error("Contributor photos must be JPG, PNG, or WEBP images.")
      );
    }

    return cb(null, true);
  }

  if (file.fieldname === "abstractFile") {
    if (!wordMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error("Abstract file must be a Word document (.doc or .docx).")
      );
    }

    return cb(null, true);
  }

  if (file.fieldname === "paymentScreenshot") {
    if (!imageMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          "Payment screenshot must be a JPG, PNG, or WEBP image."
        )
      );
    }

    return cb(null, true);
  }

  return cb(new Error(`Unexpected file field: ${file.fieldname}`));
};

const upload = multer({
  storage,

  // Upper safety limit for an individual uploaded file.
  limits: {
    fileSize: MAX_PAYMENT_SCREENSHOT_SIZE,
    files: 7, // 5 photos + 1 abstract + 1 payment screenshot
  },

  fileFilter,
});

export const abstractUploads = upload.fields([
  {
    name: "photo",
    maxCount: 5,
  },
  {
    name: "abstractFile",
    maxCount: 1,
  },
  {
    name: "paymentScreenshot",
    maxCount: 1,
  },
]);

export const validateUploadedFiles = (files) => {
  const photos = files?.photo || [];
  const abstractFile = files?.abstractFile?.[0];
  const paymentScreenshot = files?.paymentScreenshot?.[0];

  // Maximum 5 contributor photos
  if (photos.length > 5) {
    throw new Error("You can upload a maximum of 5 contributor photos.");
  }

  // Total size of all contributor photos must not exceed 5 MB
  const totalPhotoSize = photos.reduce(
    (total, photo) => total + photo.size,
    0
  );

  if (totalPhotoSize > MAX_PHOTO_TOTAL_SIZE) {
    throw new Error("The total size of all contributor photos must not exceed 5 MB.");
  }

  // Abstract document maximum size: 2 MB
  if (abstractFile && abstractFile.size > MAX_ABSTRACT_FILE_SIZE) {
    throw new Error("Abstract file must not exceed 2 MB.");
  }

  // Payment screenshot maximum size: 5 MB
  if (
    paymentScreenshot &&
    paymentScreenshot.size > MAX_PAYMENT_SCREENSHOT_SIZE
  ) {
    throw new Error("Payment screenshot must not exceed 5 MB.");
  }
};