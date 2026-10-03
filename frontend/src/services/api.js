import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const registerForConference = async (registrationData) => {
  const response = await api.post(
    "/registrations",
    registrationData
  );

  return response.data;
};

export const getRegistration = async (registrationId) => {
  const response = await api.get(
    `/registrations/${encodeURIComponent(registrationId)}`
  );

  return response.data;
};

export const submitAbstract = async ({
  registrationId,
  contributorNames,
  abstractTitle,
  mentorName,
  organizationName,
  theme,
  keywords,
  transactionId,
  photos,
  abstractFile,
  paymentScreenshot,
}) => {
  const formData = new FormData();

  formData.append("registrationId", registrationId);
  formData.append("contributorNames", contributorNames);
  formData.append("abstractTitle", abstractTitle);
  formData.append("mentorName", mentorName);
  formData.append("organizationName", organizationName);
  formData.append("theme", theme);

  // Backend converts this JSON string back into an array.
  formData.append("keywords", JSON.stringify(keywords));

  if (transactionId?.trim()) {
    formData.append("transactionId", transactionId.trim());
  }

  // Add all contributor photos
  photos?.forEach((photo) => {
    formData.append("photo", photo);
  });

  // Add abstract Word document
  if (abstractFile) {
    formData.append("abstractFile", abstractFile);
  }

  // Add payment screenshot
  if (paymentScreenshot) {
    formData.append(
      "paymentScreenshot",
      paymentScreenshot
    );
  }

  const response = await api.post(
    "/abstracts",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const getAbstractStatus = async (
  registrationId
) => {
  const response = await api.get(
    `/abstracts/status/${encodeURIComponent(
      registrationId
    )}`
  );

  return response.data;
};

export const getAbstractFileUrl = (
  registrationId
) => {
  return `${API_BASE_URL}/abstracts/${encodeURIComponent(
    registrationId
  )}/files/abstract`;
};

export const getContributorPhotoUrl = (
  registrationId,
  photoIndex
) => {
  return `${API_BASE_URL}/abstracts/${encodeURIComponent(
    registrationId
  )}/files/photo/${photoIndex}`;
};

export const getPaymentScreenshotUrl = (
  registrationId
) => {
  return `${API_BASE_URL}/abstracts/${encodeURIComponent(
    registrationId
  )}/files/payment-screenshot`;
};

export default api;