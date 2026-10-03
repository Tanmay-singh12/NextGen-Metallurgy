import React, { useEffect, useState } from "react";
import { X, Send } from "lucide-react";
import { registerForConference } from "../../services/api";
import "./RegistrationModal.css";

export default function RegistrationModal({ isOpen, onClose, onAbstractSubmit, }) {
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    year: "",
    department: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await registerForConference(formData);
      
      console.log("Registration API response:", response);
      setSuccess(response.data || response);

      setFormData({
        name: "",
        rollNumber: "",
        year: "",
        department: "",
      });
    } catch (error) {
      const responseData = error.response?.data;

      if (responseData?.errors) {
        const validationErrors = Object.values(
          responseData.errors
        )
          .flat()
          .join(" ");

        setError(
          validationErrors ||
          "Please check your registration details."
        );
      } else {
        setError(
          responseData?.message ||
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

    setFormData({
      name: "",
      rollNumber: "",
      year: "",
      department: "",
    });

    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, loading]);

  if (!isOpen) return null;

  return (
    <div
      className="registration-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) {
          handleClose();
        }
      }}
    >
      <div
        className="registration-modal"
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
                onClick={() => {
                  window.open(
                    `${import.meta.env.VITE_API_BASE_URL}/registrations/${encodeURIComponent(
                      success.registrationId
                    )}/ticket`,
                    "_blank"
                  );
                }}
              >
                Download Conference Ticket
              </button>

              <button
                type="button"
                className="abstract-button"
                onClick={() => {
                  onAbstractSubmit?.(success.registrationId);
                }}
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
        ) : (
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
                Registration for the conference is free.
              </p>
            </div>

            {error && (
              <div className="registration-error" role="alert">
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
                  <option value="" disabled>
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

                {!loading && <Send size={16} />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}