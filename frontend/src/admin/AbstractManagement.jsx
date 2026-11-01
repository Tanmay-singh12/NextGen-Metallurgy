
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Search,
  FileText,
  Image as ImageIcon,
  X,
  Download,
  AlertCircle,
  CreditCard,
  UserRound,
  Building2,
  GraduationCap,
  Tag,
} from "lucide-react";

import { api } from "./api";
import "./admin.css";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const extractList = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.abstracts)) return data.abstracts;
  if (Array.isArray(data?.submissions)) return data.submissions;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const extractPagination = (response, currentPage, itemCount) => {
  const data = response?.data;
  const pagination =
    response?.pagination ||
    data?.pagination ||
    {};

  return {
    page: Number(pagination.page || pagination.currentPage || currentPage),
    totalPages: Math.max(1, Number(pagination.totalPages || 1)),
    total: Number(
      pagination.total ??
      pagination.totalItems ??
      pagination.totalSubmissions ??
      itemCount
    ),
  };
};

const extractRecord = (response) => {
  const data = response?.data;

  return (
    data?.abstract ||
    data?.submission ||
    data?.data ||
    data
  );
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusLabel = (status) => {
  const labels = {
    UNDER_REVIEW: "Under Review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
  };

  return labels[status] || status || "Unknown";
};

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase().replaceAll("_", "-");

  return (
    <span className={`admin-abstract-status ${normalized}`}>
      {statusLabel(status)}
    </span>
  );
}

function AbstractInfo({ icon: Icon, label, children }) {
  return (
    <div className="admin-abstract-info">
      <div className="admin-abstract-info-icon">
        <Icon size={16} />
      </div>
      <div className="admin-abstract-info-content">
        <span>{label}</span>
        <strong>{children || "—"}</strong>
      </div>
    </div>
  );
}

function AbstractDetailsModal({
  registrationId,
  onClose,
  onReviewed,
}) {
  const [abstract, setAbstract] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [paymentImage, setPaymentImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [fileLoading, setFileLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileError, setFileError] = useState("");

  const [reviewLoading, setReviewLoading] = useState(false);
const [reviewError, setReviewError] = useState("");
const [showRejectForm, setShowRejectForm] = useState(false);
const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    let active = true;
    let photoUrls = [];
    let paymentUrl = "";

    const loadDetails = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(
          `/admin/abstracts/${encodeURIComponent(registrationId)}`
        );

        if (!response.data?.success) {
          throw new Error(
            response.data?.message || "Unable to load abstract details."
          );
        }

        const record = extractRecord(response.data);

        if (!record || typeof record !== "object") {
          throw new Error("The server returned invalid abstract details.");
        }

        if (!active) return;
        setAbstract(record);

        const photoMetadata = Array.isArray(record.photos)
          ? record.photos
          : [];

        const photoResults = await Promise.all(
          photoMetadata.map(async (_, index) => {
            try {
              const photoResponse = await api.get(
                `/admin/abstracts/${encodeURIComponent(registrationId)}/photos/${index}`,
                { responseType: "blob" }
              );

              const url = URL.createObjectURL(photoResponse.data);
              photoUrls[index] = url;

              return { index, url, error: "" };
            } catch {
              return {
                index,
                url: "",
                error: "Unable to load this photo.",
              };
            }
          })
        );

        if (!active) {
          photoUrls.forEach((url) => url && URL.revokeObjectURL(url));
          return;
        }

        setPhotos(photoResults);

        if (record.paymentScreenshot) {
          try {
            const paymentResponse = await api.get(
              `/admin/abstracts/${encodeURIComponent(registrationId)}/payment-screenshot`,
              { responseType: "blob" }
            );

            paymentUrl = URL.createObjectURL(paymentResponse.data);

            if (active) setPaymentImage(paymentUrl);
          } catch {
            if (active) {
              setFileError("Unable to load the payment screenshot.");
            }
          }
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load abstract details."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDetails();

    return () => {
      active = false;
      photoUrls.forEach((url) => url && URL.revokeObjectURL(url));
      if (paymentUrl) URL.revokeObjectURL(paymentUrl);
    };
  }, [registrationId]);

  const downloadAbstract = async () => {
    setFileLoading(true);
    setFileError("");

    try {
      const response = await api.get(
        `/admin/abstracts/${encodeURIComponent(registrationId)}/file`,
        { responseType: "blob" }
      );

      const blobUrl = URL.createObjectURL(response.data);
      const link = document.createElement("a");

      link.href = blobUrl;
      link.download =
        abstract?.abstractFile?.originalName || "abstract.docx";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setFileError(
        err.response?.data?.message ||
          "Unable to download the abstract document."
      );
    } finally {
      setFileLoading(false);
    }
  };

  
const handleReview = async (action) => {
  if (abstract?.status !== "UNDER_REVIEW") {
    setReviewError("This submission has already been reviewed.");
    return;
  }

  if (action === "approve") {
    const confirmed = window.confirm(
      "Are you sure you want to approve this abstract?"
    );

    if (!confirmed) return;
  }

  if (action === "reject" && !rejectionReason.trim()) {
    setReviewError("Please enter a rejection reason.");
    return;
  }

  setReviewLoading(true);
  setReviewError("");

  try {
    const endpoint =
      action === "approve" ? "approve" : "reject";

    const payload =
      action === "reject"
        ? { rejectionReason: rejectionReason.trim() }
        : {};

    const response = await api.patch(
      `/admin/abstract-review/${encodeURIComponent(registrationId)}/${endpoint}`,
      payload
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || "Unable to update abstract status."
      );
    }

    onReviewed?.();
    onClose();
  } catch (err) {
    setReviewError(
      err.response?.data?.message ||
        err.message ||
        "Review action failed. Please try again."
    );
  } finally {
    setReviewLoading(false);
  }
};


  return (
    <div className="admin-modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        className="admin-abstract-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="abstract-modal-title"
      >
        <div className="admin-modal-header">
          <div>
            <p className="admin-eyebrow">SUBMISSION DETAILS</p>
            <h2 id="abstract-modal-title">Abstract submission</h2>
          </div>

          <button
            type="button"
            className="admin-icon-button"
            onClick={onClose}
            aria-label="Close abstract details"
          >
            <X size={19} />
          </button>
        </div>

        {loading ? (
          <div className="admin-loading-panel">
            <RefreshCw size={22} className="admin-spin" />
            <p>Loading abstract details and uploaded files...</p>
          </div>
        ) : error ? (
          <div className="admin-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        ) : abstract ? (
          <>
            <div className="admin-abstract-modal-id">
              <div>
                <span>Registration ID</span>
                <strong>{abstract.registrationId || registrationId}</strong>
              </div>
              <StatusBadge status={abstract.status} />
            </div>

            <section className="admin-abstract-detail-section">
              <h3>Submission information</h3>

              <h4 className="admin-abstract-title">
                {abstract.abstractTitle || "Untitled abstract"}
              </h4>

              <div className="admin-abstract-info-grid">
                <AbstractInfo icon={UserRound} label="Contributors">
                  {Array.isArray(abstract.contributorNames)
                    ? abstract.contributorNames.join(", ")
                    : abstract.contributorNames}
                </AbstractInfo>

                <AbstractInfo icon={GraduationCap} label="Mentor">
                  {abstract.mentorName}
                </AbstractInfo>

                <AbstractInfo icon={Building2} label="Organization">
                  {abstract.organizationName}
                </AbstractInfo>

                <AbstractInfo icon={Tag} label="Theme">
                  {abstract.theme}
                </AbstractInfo>
              </div>

              <div className="admin-abstract-keywords">
                <h4>Keywords</h4>
                <div className="admin-keyword-list">
                  {(abstract.keywords || []).map((keyword, index) => (
                    <span key={`${keyword}-${index}`}>{keyword}</span>
                  ))}
                  {(!abstract.keywords || abstract.keywords.length === 0) && (
                    <span>No keywords provided</span>
                  )}
                </div>
              </div>

              <p className="admin-abstract-submitted-date">
                Submitted: {formatDate(abstract.createdAt)}
              </p>

              {abstract.status === "REJECTED" && abstract.rejectionReason && (
                <div className="admin-rejection-reason">
                  <strong>Rejection reason</strong>
                  <p>{abstract.rejectionReason}</p>
                </div>
              )}
            </section>


            
{abstract.status === "UNDER_REVIEW" && (
  <section className="admin-review-actions">
    <div>
      <p className="admin-eyebrow">REVIEW DECISION</p>
      <h3>Review this submission</h3>
      <p>
        Approve the abstract or reject it with a clear reason
        for the submitter.
      </p>
    </div>

    {reviewError && (
      <div className="admin-error-banner" role="alert">
        <AlertCircle size={17} />
        <span>{reviewError}</span>
      </div>
    )}

    {showRejectForm && (
      <div className="admin-rejection-form">
        <label htmlFor="admin-rejection-reason">
          Rejection reason
        </label>

        <textarea
          id="admin-rejection-reason"
          rows={4}
          value={rejectionReason}
          onChange={(event) =>
            setRejectionReason(event.target.value)
          }
          placeholder="Explain why this abstract is being rejected..."
          maxLength={1000}
          disabled={reviewLoading}
        />

        <div className="admin-rejection-form-footer">
          <span>{rejectionReason.length}/1000 characters</span>

          <button
            type="button"
            className="admin-secondary-button"
            onClick={() => {
              setShowRejectForm(false);
              setRejectionReason("");
              setReviewError("");
            }}
            disabled={reviewLoading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="admin-reject-button"
            onClick={() => handleReview("reject")}
            disabled={reviewLoading || !rejectionReason.trim()}
          >
            {reviewLoading ? "Submitting..." : "Confirm rejection"}
          </button>
        </div>
      </div>
    )}

    {!showRejectForm && (
      <div className="admin-review-buttons">
        <button
          type="button"
          className="admin-reject-button"
          onClick={() => {
            setReviewError("");
            setShowRejectForm(true);
          }}
          disabled={reviewLoading}
        >
          Reject abstract
        </button>

        <button
          type="button"
          className="admin-approve-button"
          onClick={() => handleReview("approve")}
          disabled={reviewLoading}
        >
          {reviewLoading ? "Processing..." : "Approve abstract"}
        </button>
      </div>
    )}
  </section>
)}


            <section className="admin-abstract-detail-section">
              <div className="admin-abstract-section-heading">
                <h3>
                  <ImageIcon size={18} />
                  Contributor photos
                </h3>
                <span>{photos.length} uploaded</span>
              </div>

              {photos.length > 0 ? (
                <div className="admin-contributor-photo-grid">
                  {photos.map((photo) => (
                    <div className="admin-contributor-photo" key={photo.index}>
                      {photo.url ? (
                        <a href={photo.url} target="_blank" rel="noreferrer">
                          <img
                            src={photo.url}
                            alt={`Contributor ${photo.index + 1}`}
                          />
                        </a>
                      ) : (
                        <div className="admin-photo-placeholder">
                          <ImageIcon size={22} />
                          <span>{photo.error}</span>
                        </div>
                      )}
                      <span>Photo {photo.index + 1}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="admin-abstract-muted">
                  No contributor photos were uploaded.
                </p>
              )}
            </section>

            <section className="admin-abstract-detail-section">
              <div className="admin-abstract-section-heading">
                <h3>
                  <FileText size={18} />
                  Abstract document
                </h3>
              </div>

              <div className="admin-uploaded-file">
                <div className="admin-uploaded-file-icon">
                  <FileText size={21} />
                </div>
                <div className="admin-uploaded-file-info">
                  <strong>
                    {abstract.abstractFile?.originalName || "Abstract document"}
                  </strong>
                  <span>
                    {abstract.abstractFile?.mimeType || "Word document"}
                  </span>
                </div>
                <button
                  type="button"
                  className="admin-download-button"
                  onClick={downloadAbstract}
                  disabled={fileLoading}
                >
                  {fileLoading ? (
                    <RefreshCw size={15} className="admin-spin" />
                  ) : (
                    <Download size={15} />
                  )}
                  {fileLoading ? "Downloading" : "Download"}
                </button>
              </div>

              {fileError && (
                <p className="admin-file-error">{fileError}</p>
              )}
            </section>

            <section className="admin-abstract-detail-section">
              <div className="admin-abstract-section-heading">
                <h3>
                  <CreditCard size={18} />
                  Payment screenshot
                </h3>
              </div>

              {paymentImage ? (
                <a
                  className="admin-payment-image-link"
                  href={paymentImage}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={paymentImage}
                    alt="Payment proof"
                    className="admin-payment-image"
                  />
                </a>
              ) : (
                <p className="admin-abstract-muted">
                  {fileError || "No payment screenshot available."}
                </p>
              )}

              {abstract.transactionId && (
                <p className="admin-transaction-id">
                  Transaction ID: <strong>{abstract.transactionId}</strong>
                </p>
              )}
            </section>
          </>
        ) : null}

        <div className="admin-modal-footer">
          <button
            type="button"
            className="admin-secondary-button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

export default function AbstractManagement() {
  const navigate = useNavigate();

  const [abstracts, setAbstracts] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRegistrationId, setSelectedRegistrationId] = useState("");

  const fetchAbstracts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/abstracts", {
        params: {
          page,
          limit: PAGE_SIZE,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
        },
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to load abstract submissions."
        );
      }

      const list = extractList(response.data);
      const pageInfo = extractPagination(response.data, page, list.length);

      setAbstracts(list);
      setPagination({
        total: pageInfo.total || list.length,
        totalPages: pageInfo.totalPages,
      });
    } catch (err) {
      setAbstracts([]);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load abstract submissions."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchAbstracts();
  }, [fetchAbstracts]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const changeStatus = (value) => {
    setStatus(value);
    setPage(1);
  };

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <div className="admin-brand">
          <div className="admin-brand-mark">NM</div>
          <div>
            <h1>Admin Console</h1>
            <p>NextGen Materials Conference</p>
          </div>
        </div>

        <button
          type="button"
          className="admin-logout-button"
          onClick={() => navigate("/admin/dashboard")}
        >
          <ArrowLeft size={16} />
          Dashboard
        </button>
      </header>

      <section className="admin-dashboard-content">
        <div className="admin-page-heading">
          <div>
            <p className="admin-eyebrow">SUBMISSION MANAGEMENT</p>
            <h2>Abstract Submissions</h2>
            <p className="admin-heading-description">
              Review submitted abstracts, contributor photos and payment documents.
            </p>
          </div>

          <button
            type="button"
            className="admin-refresh-button"
            onClick={fetchAbstracts}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "admin-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <section className="admin-abstract-toolbar">
          <form className="admin-search-form" onSubmit={handleSearch}>
            <Search size={18} />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search title, registration ID, contributor, mentor..."
              aria-label="Search abstract submissions"
            />

            {searchInput && (
              <button
                type="button"
                className="admin-clear-search"
                onClick={clearSearch}
              >
                Clear
              </button>
            )}

            <button type="submit" className="admin-search-button">
              Search
            </button>
          </form>

          <select
            className="admin-status-filter"
            value={status}
            onChange={(event) => changeStatus(event.target.value)}
            aria-label="Filter by abstract status"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </section>

        <div className="admin-abstract-result-count">
          <FileText size={17} />
          <span>
            {pagination.total.toLocaleString("en-IN")} submissions
          </span>
        </div>

        {error && (
          <div className="admin-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button type="button" onClick={fetchAbstracts}>
              Retry
            </button>
          </div>
        )}

        <section className="admin-table-panel">
          <div className="admin-table-heading">
            <div>
              <h3>Submitted abstracts</h3>
              <p>
                {status ? statusLabel(status) : "All submission statuses"}
                {search ? ` · Search: "${search}"` : ""}
              </p>
            </div>

            <span className="admin-table-page-label">
              Page {page} of {pagination.totalPages}
            </span>
          </div>

          {loading ? (
            <div className="admin-loading-panel">
              <RefreshCw size={22} className="admin-spin" />
              <p>Loading abstract submissions...</p>
            </div>
          ) : abstracts.length === 0 ? (
            <div className="admin-empty-state">
              <FileText size={30} />
              <h3>No abstract submissions found</h3>
              <p>
                Try changing your search or status filter.
              </p>
              {(search || status) && (
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() => {
                    clearSearch();
                    setStatus("");
                    setPage(1);
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="admin-table-scroll">
                <table className="admin-registration-table">
                  <thead>
                    <tr>
                      <th>Abstract title</th>
                      <th>Registration ID</th>
                      <th>Contributors</th>
                      <th>Theme</th>
                      <th>Submitted on</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {abstracts.map((item, index) => (
                      <tr
                        key={
                          item.registrationId ||
                          item._id ||
                          `${item.abstractTitle}-${index}`
                        }
                      >
                        <td>
                          <div className="admin-attendee-cell">
                            <strong>
                              {item.abstractTitle || "Untitled abstract"}
                            </strong>
                            <span>{item.mentorName || "No mentor listed"}</span>
                          </div>
                        </td>

                        <td>
                          <span className="admin-id-text">
                            {item.registrationId || "—"}
                          </span>
                        </td>

                        <td>
                          {Array.isArray(item.contributorNames)
                            ? item.contributorNames.join(", ")
                            : item.contributorNames || "—"}
                        </td>

                        <td>{item.theme || "—"}</td>
                        <td>{formatDate(item.createdAt)}</td>

                        <td>
                          <StatusBadge status={item.status} />
                        </td>

                        <td>
                          <button
                            type="button"
                            className="admin-view-button"
                            onClick={() =>
                              setSelectedRegistrationId(item.registrationId)
                            }
                            disabled={!item.registrationId}
                          >
                            <Eye size={15} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-pagination">
                <span>
                  Showing {abstracts.length} of{" "}
                  {pagination.total.toLocaleString("en-IN")} submissions
                </span>

                <div className="admin-pagination-actions">
                  <button
                    type="button"
                    className="admin-pagination-button"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    <ChevronLeft size={17} />
                    Previous
                  </button>

                  <span className="admin-current-page">{page}</span>

                  <button
                    type="button"
                    className="admin-pagination-button"
                    disabled={page >= pagination.totalPages || loading}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </section>

      {selectedRegistrationId && (
        <AbstractDetailsModal
          registrationId={selectedRegistrationId}
          onClose={() => setSelectedRegistrationId("")}
          onReviewed={fetchAbstracts}
        />
      )}
    </main>
  );
}
