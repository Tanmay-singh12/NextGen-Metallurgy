import React, { useEffect, useState } from "react";
import { X, Upload, FileText, CheckCircle2 } from "lucide-react";

import { submitAbstract } from "../../services/api";
import "./AbstractSubmissionModal.css";

const THEMES = [
    "Manufacturing and Process Metallurgy",
    "Characterization",
    "Advanced Materials",
    "Materials Informatics",
    "Non Core",
    "Other",
];

const MAX_PHOTOS = 5;
const MAX_PHOTO_TOTAL_SIZE = 5 * 1024 * 1024;
const MAX_ABSTRACT_SIZE = 2 * 1024 * 1024;
const MAX_PAYMENT_SCREENSHOT_SIZE = 5 * 1024 * 1024;

const getTotalSize = (files) =>
    files.reduce((total, file) => total + file.size, 0);

export default function AbstractSubmissionModal({
    isOpen,
    onClose,
    registrationId,
}) {
    const [formData, setFormData] = useState({
        contributorNames: "",
        abstractTitle: "",
        mentorName: "",
        organizationName: "",
        theme: "",
        keywords: ["", "", "", "", ""],
        transactionId: "",
    });

    const [photos, setPhotos] = useState([]);
    const [abstractFile, setAbstractFile] = useState(null);
    const [paymentScreenshot, setPaymentScreenshot] =
        useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event) => {
            if (event.key === "Escape" && !loading) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener(
                "keydown",
                handleEscape
            );

            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen, loading, onClose]);

    if (!isOpen) {
        return null;
    }

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
    };

    const handleKeywordChange = (index, value) => {
        setFormData((previous) => {
            const keywords = [...previous.keywords];
            keywords[index] = value;

            return {
                ...previous,
                keywords,
            };
        });

        setError("");
    };

    const handlePhotoChange = (event) => {
        const selectedFiles = Array.from(
            event.target.files || []
        );

        setError("");

        if (selectedFiles.length > MAX_PHOTOS) {
            setError(
                "You can upload a maximum of 5 contributor photos."
            );
            event.target.value = "";
            return;
        }

        const invalidType = selectedFiles.find(
            (file) =>
                ![
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                ].includes(file.type)
        );

        if (invalidType) {
            setError(
                "Contributor photos must be JPG, PNG, or WEBP images."
            );
            event.target.value = "";
            return;
        }

        const totalSize = getTotalSize(selectedFiles);

        if (totalSize > MAX_PHOTO_TOTAL_SIZE) {
            setError(
                "The total size of all contributor photos must not exceed 5 MB."
            );
            event.target.value = "";
            return;
        }

        setPhotos(selectedFiles);
    };

    const handleAbstractFileChange = (event) => {
        const file = event.target.files?.[0];

        setError("");

        if (!file) {
            setAbstractFile(null);
            return;
        }

        const validTypes = [
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (!validTypes.includes(file.type)) {
            setError(
                "Abstract file must be a Word document (.doc or .docx)."
            );
            event.target.value = "";
            return;
        }

        if (file.size > MAX_ABSTRACT_SIZE) {
            setError("Abstract file must not exceed 2 MB.");
            event.target.value = "";
            return;
        }

        setAbstractFile(file);
    };

    const handlePaymentScreenshotChange = (event) => {
        const file = event.target.files?.[0];

        setError("");

        if (!file) {
            setPaymentScreenshot(null);
            return;
        }

        const validTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!validTypes.includes(file.type)) {
            setError(
                "Payment screenshot must be a JPG, PNG, or WEBP image."
            );
            event.target.value = "";
            return;
        }

        if (file.size > MAX_PAYMENT_SCREENSHOT_SIZE) {
            setError(
                "Payment screenshot must not exceed 5 MB."
            );
            event.target.value = "";
            return;
        }

        setPaymentScreenshot(file);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!registrationId) {
            setError(
                "Valid registration ID is required."
            );
            return;
        }

        const keywords = formData.keywords
            .map((keyword) => keyword.trim())
            .filter(Boolean);

        if (keywords.length !== 5) {
            setError("Please enter exactly five keywords.");
            return;
        }

        if (!abstractFile) {
            setError("Please upload your abstract file.");
            return;
        }

        if (!paymentScreenshot) {
            setError(
                "Please upload your payment screenshot."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await submitAbstract({
                registrationId,
                contributorNames:
                    formData.contributorNames,
                abstractTitle:
                    formData.abstractTitle,
                mentorName:
                    formData.mentorName,
                organizationName:
                    formData.organizationName,
                theme: formData.theme,
                keywords,
                transactionId:
                    formData.transactionId,
                photos,
                abstractFile,
                paymentScreenshot,
            });

            setSuccess(response.data || response);
        } catch (requestError) {
            const backendMessage =
                requestError.response?.data?.message;

            const backendErrors =
                requestError.response?.data?.errors;

            if (backendErrors) {
                const firstError = Object.values(
                    backendErrors
                ).flat()?.[0];

                setError(
                    firstError ||
                    backendMessage ||
                    "Unable to submit abstract."
                );
            } else {
                setError(
                    backendMessage ||
                    "Unable to submit abstract. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;

        setFormData({
            contributorNames: "",
            abstractTitle: "",
            mentorName: "",
            organizationName: "",
            theme: "",
            keywords: ["", "", "", "", ""],
            transactionId: "",
        });

        setPhotos([]);
        setAbstractFile(null);
        setPaymentScreenshot(null);
        setError("");
        setSuccess(null);

        onClose();
    };

    return (
        <div
            className="abstract-modal-overlay"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !loading
                ) {
                    handleClose();
                }
            }}
        >
            <div className="abstract-modal">
                <button
                    type="button"
                    className="abstract-modal-close"
                    onClick={handleClose}
                    disabled={loading}
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                {!success ? (
                    <>
                        <div className="abstract-modal-header">
                            <span className="abstract-modal-eyebrow">
                                METALLUM · MME 2026
                            </span>

                            <h2>Submit Your Abstract</h2>

                            <p>
                                Submit your abstract and payment details
                                for review.
                            </p>

                            <div className="abstract-registration-id">
                                Registration ID:{" "}
                                <strong>{registrationId}</strong>
                            </div>
                        </div>

                        <form
                            className="abstract-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="abstract-form-section">
                                <h3>Contributor Details</h3>

                                <label>
                                    Names of Contributors
                                    <span>*</span>
                                </label>

                                <textarea
                                    name="contributorNames"
                                    value={formData.contributorNames}
                                    onChange={handleChange}
                                    placeholder="Enter all contributor names"
                                    rows={3}
                                    required
                                />

                                <p className="abstract-help">
                                    You can enter multiple contributor names.
                                </p>

                                <label>
                                    Contributor Photos
                                </label>

                                <div className="file-upload-box">
                                    <input
                                        id="contributorPhotos"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        multiple
                                        onChange={handlePhotoChange}
                                    />

                                    <label htmlFor="contributorPhotos">
                                        <Upload size={20} />
                                        <span>
                                            {photos.length
                                                ? `${photos.length} photo${photos.length > 1
                                                    ? "s"
                                                    : ""
                                                } selected`
                                                : "Choose contributor photos"}
                                        </span>
                                    </label>
                                </div>

                                <p className="abstract-help">
                                    Maximum 5 images · JPG, PNG or WEBP ·
                                    total size up to 5 MB
                                </p>

                                {photos.length > 0 && (
                                    <div className="selected-files">
                                        {photos.map((file, index) => (
                                            <div
                                                className="selected-file"
                                                key={`${file.name}-${index}`}
                                            >
                                                <span>{file.name}</span>
                                                <small>
                                                    {(
                                                        file.size /
                                                        (1024 * 1024)
                                                    ).toFixed(2)}{" "}
                                                    MB
                                                </small>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="abstract-form-section">
                                <h3>Abstract Details</h3>

                                <label>
                                    Abstract Title
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    name="abstractTitle"
                                    value={formData.abstractTitle}
                                    onChange={handleChange}
                                    placeholder="Enter your abstract title"
                                    maxLength={300}
                                    required
                                />

                                <div className="abstract-two-column">
                                    <div>
                                        <label>
                                            Mentor Name
                                            <span>*</span>
                                        </label>

                                        <input
                                            type="text"
                                            name="mentorName"
                                            value={formData.mentorName}
                                            onChange={handleChange}
                                            placeholder="Enter mentor name"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label>
                                            Organization Name
                                            <span>*</span>
                                        </label>

                                        <input
                                            type="text"
                                            name="organizationName"
                                            value={
                                                formData.organizationName
                                            }
                                            onChange={handleChange}
                                            placeholder="College / Organization"
                                            required
                                        />
                                    </div>
                                </div>

                                <label>
                                    Theme
                                    <span>*</span>
                                </label>

                                <select
                                    name="theme"
                                    value={formData.theme}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Select a theme
                                    </option>

                                    {THEMES.map((theme) => (
                                        <option key={theme} value={theme}>
                                            {theme}
                                        </option>
                                    ))}
                                </select>

                                <label>
                                    Five Keywords
                                    <span>*</span>
                                </label>

                                <div className="keywords-grid">
                                    {formData.keywords.map(
                                        (keyword, index) => (
                                            <input
                                                key={index}
                                                type="text"
                                                value={keyword}
                                                onChange={(event) =>
                                                    handleKeywordChange(
                                                        index,
                                                        event.target.value
                                                    )
                                                }
                                                placeholder={`Keyword ${index + 1
                                                    }`}
                                                required
                                            />
                                        )
                                    )}
                                </div>

                                <label>
                                    Abstract File
                                    <span>*</span>
                                </label>

                                <div className="file-upload-box">
                                    <input
                                        id="abstractFile"
                                        type="file"
                                        accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        onChange={
                                            handleAbstractFileChange
                                        }
                                    />

                                    <label htmlFor="abstractFile">
                                        <FileText size={20} />

                                        <span>
                                            {abstractFile
                                                ? abstractFile.name
                                                : "Choose Word document"}
                                        </span>
                                    </label>
                                </div>

                                <p className="abstract-help">
                                    Only .doc or .docx · Maximum size 2 MB
                                </p>
                            </div>

                            <div className="abstract-form-section">
                                <h3>Payment Details</h3>

                                <div className="payment-qr-section">
                                    <div>
                                        <h4>Pay the registration fee</h4>
                                        <p>
                                            Scan the QR code below and complete
                                            your payment.
                                        </p>
                                    </div>

                                    <div className="payment-qr-placeholder">
                                        <img
                                            src="/payment-qr.png"
                                            alt="Conference payment QR code"
                                        />
                                    </div>


                                    {/* <div className="payment-qr-image">
                                        <img
                                            src="/payment-qr.png"
                                            alt="Conference payment QR code"
                                        />
                                    </div> */}





                                </div>

                                <label>
                                    Transaction ID
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    name="transactionId"
                                    value={formData.transactionId}
                                    onChange={handleChange}
                                    placeholder="Enter payment transaction ID"
                                    required
                                />

                                <label>
                                    Payment Screenshot
                                    <span>*</span>
                                </label>

                                <div className="file-upload-box">
                                    <input
                                        id="paymentScreenshot"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={
                                            handlePaymentScreenshotChange
                                        }
                                    />

                                    <label htmlFor="paymentScreenshot">
                                        <Upload size={20} />

                                        <span>
                                            {paymentScreenshot
                                                ? paymentScreenshot.name
                                                : "Choose payment screenshot"}
                                        </span>
                                    </label>
                                </div>

                                <p className="abstract-help">
                                    JPG, PNG or WEBP · Maximum size 5 MB
                                </p>
                            </div>

                            {error && (
                                <div className="abstract-form-error">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="abstract-submit-button"
                                disabled={loading}
                            >
                                {loading
                                    ? "Submitting..."
                                    : "Submit Abstract"}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="abstract-success">
                        <CheckCircle2 size={56} />

                        <span className="abstract-modal-eyebrow">
                            SUBMISSION RECEIVED
                        </span>

                        <h2>Abstract Submitted</h2>

                        <p>
                            Your abstract has been successfully
                            submitted and is currently under review.
                        </p>

                        <div className="abstract-success-details">
                            <div>
                                <span>Registration ID</span>
                                <strong>
                                    {success.registrationId}
                                </strong>
                            </div>

                            <div>
                                <span>Abstract</span>
                                <strong>
                                    {success.abstractTitle}
                                </strong>
                            </div>

                            <div>
                                <span>Status</span>
                                <strong>UNDER REVIEW</strong>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="abstract-submit-button"
                            onClick={handleClose}
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}