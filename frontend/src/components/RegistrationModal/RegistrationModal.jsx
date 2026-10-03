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
  rollNumber: "",
  year: "",
  department: "",
};

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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");
    setSuccess(null);
    setExistingRegistration(null);

    const rollNumber = formData.rollNumber.trim();

    if (!rollNumber) {
      setError("Roll number is required.");
      return;
    }

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
        ...formData,
        rollNumber,
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

    window.open(ticketUrl, "_blank", "noopener,noreferrer");
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
              Your conference registration has been
              successfully completed.
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
                <strong>
                  {success.name}
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
                <strong>
                  {success.year}
                </strong>
              </div>

              <div>
                <span>Department</span>
                <strong>
                  {success.department}
                </strong>
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
                  <span>
                    ABSTRACT STATUS
                  </span>

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
                Conference Registration
              </p>

              <h3 id="registration-title">
                Reserve your
                <br />
                <em>place.</em>
              </h3>

              <p>
                Registration for the conference is
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
                Roll number

                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  placeholder="Enter your roll number"
                  autoComplete="off"
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

                  <option value="1st Year">
                    1st Year
                  </option>

                  <option value="2nd Year">
                    2nd Year
                  </option>

                  <option value="3rd Year">
                    3rd Year
                  </option>

                  <option value="4th Year">
                    4th Year
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </label>

              <label>
                Department

                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Enter your department"
                  required
                  disabled={loading}
                />
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