import React, { useEffect, useState } from "react";
import { X, Send, Download } from "lucide-react";

import {
  registerForConference,
  getRegistrationStatusByRollNumber,
} from "../../services/api";

import "./RegistrationModal.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

const EMPTY_FORM = {
  name: "",
  email: "",
  mobileNumber: "",
  rollNumber: "",
  year: "",
  department: "",
};

const YEAR_OPTIONS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "MTech/Phd",
  "Faculty or Staff",
  "Other",
];

const DEPARTMENT_OPTIONS = [
  "Metallurgical & Materials Engineering",
  "Computer Science & Engineering",
  "Electronics & Communication Engineering",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Architecture & Planning",
  "Other",
];

export default function RegistrationModal({
  isOpen,
  onClose,
  onAbstractSubmit,
}) {
  const [formData, setFormData] = useState(EMPTY_FORM);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [existingRegistration, setExistingRegistration] =
    useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;

    let updatedValue = value;

    if (name === "rollNumber") {
      updatedValue = value.toUpperCase().replace(/\s/g, "");
    }

    if (name === "mobileNumber") {
      updatedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    if (error) {
      setError("");
    }
  };

  const validateForm = () => {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const mobileNumber = formData.mobileNumber.trim();
    const rollNumber = formData.rollNumber.trim().toUpperCase();
    const year = formData.year.trim();
    const department = formData.department.trim();

    if (!name) {
      return "Name is required.";
    }

    if (!email) {
      return "Email is required.";
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }

    if (!mobileNumber) {
      return "Mobile number is required.";
    }

    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      return "Please enter a valid 10-digit mobile number.";
    }

    if (!rollNumber) {
      return "Roll number is required.";
    }

    if (!/^BT[A-Z0-9]{8}$/.test(rollNumber)) {
      return "Roll number must be in the format BTXXXXXXXX.";
    }

    if (!year) {
      return "Year of study is required.";
    }

    if (!department) {
      return "Department is required.";
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");
    setSuccess(null);
    setExistingRegistration(null);

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const rollNumber =
      formData.rollNumber.trim().toUpperCase();

    try {
      setLoading(true);

      /*
       * STEP 1
       * Check whether this roll number is already registered.
       */
      try {
        const statusResponse =
          await getRegistrationStatusByRollNumber(
            rollNumber
          );

        if (
          statusResponse?.success &&
          statusResponse?.data?.registration
        ) {
          setExistingRegistration(statusResponse.data);
          return;
        }
      } catch (statusError) {
        /*
         * 404 means the roll number is new.
         * Continue with registration.
         */
        if (statusError.response?.status !== 404) {
          throw statusError;
        }
      }

      /*
       * STEP 2
       * New participant → create registration.
       */
      const response = await registerForConference({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobileNumber: formData.mobileNumber.trim(),
        rollNumber,
        year: formData.year.trim(),
        department: formData.department.trim(),
      });

      const registrationData =
        response?.data || response;

      if (!registrationData?.registrationId) {
        throw new Error(
          "Registration was created, but registration details were not returned."
        );
      }

      /*
       * STEP 3
       * Show successful registration screen.
       */
      setSuccess({
        registrationId:
          registrationData.registrationId,
        name: registrationData.name,
        email: registrationData.email,
        mobileNumber: registrationData.mobileNumber,
        rollNumber: registrationData.rollNumber,
        year: registrationData.year,
        department: registrationData.department,
        createdAt: registrationData.createdAt,
      });

      setFormData(EMPTY_FORM);
    } catch (requestError) {
      const backendMessage =
        requestError.response?.data?.message;

      const backendErrors =
        requestError.response?.data?.errors;

      if (backendErrors) {
        const firstError = Object.values(
          backendErrors
        )
          .flat()
          ?.find(Boolean);

        setError(
          firstError ||
            backendMessage ||
            "Registration failed."
        );
      } else {
        setError(
          backendMessage ||
            requestError.message ||
            "Registration failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;

    setError("");
    setSuccess(null);
    setExistingRegistration(null);
    setFormData(EMPTY_FORM);

    onClose();
  };

  const handleDownloadTicket = () => {
    if (!success?.registrationId) return;

    const ticketUrl =
      `${API_BASE_URL}/registrations/` +
      `${encodeURIComponent(success.registrationId)}/ticket`;

    window.open(
      ticketUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleSubmitAbstract = (registrationId) => {
    if (!registrationId) return;

    onAbstractSubmit?.(registrationId);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );

      document.body.style.overflow = "";
    };
  }, [isOpen, loading]);

  if (!isOpen) return null;

  return (
    <div
      className="registration-overlay"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !loading
        ) {
          handleClose();
        }
      }}
    >
      <div
        className="conference-registration-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="registration-title"
      >
        <button
          type="button"
          className="registration-close"
          onClick={handleClose}
          disabled={loading}
          aria-label="Close registration form"
        >
          <X size={20} />
        </button>

        {/* =====================================================
            NEW REGISTRATION SUCCESS
        ====================================================== */}
        {success ? (
          <div className="registration-success">
            <p className="eyebrow">
              Registration Confirmed
            </p>

            <h3>
              You're
              <br />
              <em>registered.</em>
            </h3>

            <p>
              Your registration for the Symposium has
              been successfully completed.
            </p>

            <div className="registration-details">
              <div>
                <span>Registration ID</span>
                <strong>
                  {success.registrationId}
                </strong>
              </div>

              <div>
                <span>Name</span>
                <strong>{success.name}</strong>
              </div>

              <div>
                <span>Email</span>
                <strong>{success.email}</strong>
              </div>

              <div>
                <span>Mobile Number</span>
                <strong>
                  {success.mobileNumber}
                </strong>
              </div>

              <div>
                <span>Roll Number</span>
                <strong>
                  {success.rollNumber}
                </strong>
              </div>

              <div>
                <span>Year</span>
                <strong>{success.year}</strong>
              </div>

              <div>
                <span>Department</span>
                <strong>{success.department}</strong>
              </div>
            </div>

            <p className="ticket-note">
              Your conference ticket is ready.
            </p>

            <div className="registration-success-actions">
              <button
                type="button"
                className="register registration-submit"
                onClick={handleDownloadTicket}
              >
                <Download size={16} />
                Download Conference Ticket
              </button>

              <button
                type="button"
                className="abstract-button"
                onClick={() =>
                  handleSubmitAbstract(
                    success.registrationId
                  )
                }
              >
                Submit Abstract
              </button>

              <button
                type="button"
                className="done-button"
                onClick={handleClose}
              >
                Done
              </button>
            </div>
          </div>

        ) : existingRegistration ? (

          /* =====================================================
             EXISTING REGISTRATION
          ====================================================== */
          <div className="registration-success">
            <p className="eyebrow">
              Already Registered
            </p>

            <h3>
              You're
              <br />
              <em>already registered.</em>
            </h3>

            <p>
              We found an existing conference
              registration for this roll number.
            </p>

            <div className="registration-details">
              <div>
                <span>Registration ID</span>
                <strong>
                  {
                    existingRegistration.registration
                      .registrationId
                  }
                </strong>
              </div>

              <div>
                <span>Name</span>
                <strong>
                  {
                    existingRegistration.registration
                      .name
                  }
                </strong>
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {
                    existingRegistration.registration
                      .email || "Not available"
                  }
                </strong>
              </div>

              <div>
                <span>Mobile Number</span>
                <strong>
                  {
                    existingRegistration.registration
                      .mobileNumber || "Not available"
                  }
                </strong>
              </div>

              <div>
                <span>Roll Number</span>
                <strong>
                  {
                    existingRegistration.registration
                      .rollNumber
                  }
                </strong>
              </div>

              <div>
                <span>Year</span>
                <strong>
                  {
                    existingRegistration.registration
                      .year
                  }
                </strong>
              </div>

              <div>
                <span>Department</span>
                <strong>
                  {
                    existingRegistration.registration
                      .department
                  }
                </strong>
              </div>
            </div>

            {existingRegistration.abstract
              ?.submitted ? (
              <>
                <div className="abstract-status-card">
                  <span>ABSTRACT STATUS</span>

                  <strong>
                    {
                      existingRegistration.abstract
                        .status
                    }
                  </strong>

                  <p>
                    {
                      existingRegistration.abstract
                        .abstractTitle
                    }
                  </p>

                  {existingRegistration.abstract
                    .rejectionReason && (
                    <p>
                      <strong>
                        Rejection Reason:
                      </strong>{" "}
                      {
                        existingRegistration.abstract
                          .rejectionReason
                      }
                    </p>
                  )}
                </div>

                <p className="ticket-note">
                  Your abstract has already been
                  submitted. The current status is
                  shown above.
                </p>
              </>
            ) : (
              <>
                <div className="abstract-status-card">
                  <span>ABSTRACT</span>

                  <strong>
                    Not Submitted
                  </strong>

                  <p>
                    You have not submitted an
                    abstract yet.
                  </p>
                </div>

                <button
                  type="button"
                  className="abstract-button"
                  onClick={() =>
                    handleSubmitAbstract(
                      existingRegistration
                        .registration.registrationId
                    )
                  }
                >
                  Submit Abstract
                </button>
              </>
            )}

            <button
              type="button"
              className="done-button"
              onClick={handleClose}
            >
              Close
            </button>
          </div>

        ) : (

          /* =====================================================
             NORMAL REGISTRATION FORM
          ====================================================== */
          <>
            <div className="registration-header">
              <p className="eyebrow">
                Symposium Registration
              </p>

              <h3 id="registration-title">
                Reserve your
                <em>place.</em>
              </h3>

              <p>
                Registration for the Symposium is
                free.
              </p>
            </div>

            {error && (
              <div
                className="registration-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="registration-form"
            >
              <label>
                Full name

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  disabled={loading}
                />
              </label>

              <label>
                Email

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  disabled={loading}
                />
              </label>

              <label>
                Mobile number

                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="Enter 10-digit mobile number"
                  autoComplete="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  disabled={loading}
                />
              </label>

              <label>
                Roll number

                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  placeholder="Example: BT25MME091"
                  autoComplete="off"
                  maxLength={10}
                  required
                  disabled={loading}
                />
              </label>

              <label>
                Year of study

                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option
                    value=""
                    disabled
                  >
                    Select your year
                  </option>

                  {YEAR_OPTIONS.map((year) => (
                    <option
                      key={year}
                      value={year}
                    >
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Department

                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option
                    value=""
                    disabled
                  >
                    Select your department
                  </option>

                  {DEPARTMENT_OPTIONS.map(
                    (department) => (
                      <option
                        key={department}
                        value={department}
                      >
                        {department}
                      </option>
                    )
                  )}
                </select>
              </label>

              <button
                type="submit"
                className="register registration-submit"
                disabled={loading}
              >
                {loading
                  ? "Registering..."
                  : "Register for Conference"}

                {!loading && (
                  <Send size={16} />
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}