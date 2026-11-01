
import { useCallback, useEffect, useState } from "react";
import {
    ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Search,
  Users,
  X,
  AlertCircle,
  CalendarDays,
  Mail,
  Phone,
  Hash,
  GraduationCap,
  Building2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { api }   from "./api";
import "./admin.css";

const PAGE_SIZE = 10;

const getRegistrationList = (responseData) => {
  const data = responseData?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.registrations)) return data.registrations;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const getPagination = (responseData, currentPage) => {
  const data = responseData?.data;
  const pagination =
    responseData?.pagination ||
    data?.pagination ||
    {};

  return {
    page: Number(pagination.page || pagination.currentPage || currentPage),
    totalPages: Number(pagination.totalPages || 1),
    total: Number(
      pagination.total ??
      pagination.totalRegistrations ??
      pagination.totalItems ??
      0
    ),
  };
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

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="admin-detail-item">
      <div className="admin-detail-icon">
        <Icon size={17} />
      </div>
      <div>
        <p>{label}</p>
        <strong>{value || "—"}</strong>
      </div>
    </div>
  );
}

function RegistrationDetailsModal({ registration, onClose }) {
  if (!registration) return null;

  return (
    <div
      className="admin-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="admin-registration-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="registration-modal-title"
      >
        <div className="admin-modal-header">
          <div>
            <p className="admin-eyebrow">ATTENDEE INFORMATION</p>
            <h2 id="registration-modal-title">Registration details</h2>
          </div>

          <button
            type="button"
            className="admin-icon-button"
            onClick={onClose}
            aria-label="Close details"
          >
            <X size={19} />
          </button>
        </div>

        <div className="admin-registration-id">
          <span>Registration ID</span>
          <strong>{registration.registrationId || "—"}</strong>
        </div>

        <div className="admin-details-grid">
          <DetailItem
            icon={Users}
            label="Full name"
            value={registration.name}
          />
          <DetailItem
            icon={Mail}
            label="Email address"
            value={registration.email}
          />
          <DetailItem
            icon={Phone}
            label="Mobile number"
            value={registration.mobileNumber}
          />
          <DetailItem
            icon={Hash}
            label="Roll number"
            value={registration.rollNumber}
          />
          <DetailItem
            icon={GraduationCap}
            label="Year of study"
            value={registration.year}
          />
          <DetailItem
            icon={Building2}
            label="Department"
            value={registration.department}
          />
          <DetailItem
            icon={CalendarDays}
            label="Registration date"
            value={formatDate(registration.createdAt)}
          />
        </div>

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

export default function RegistrationManagement() {
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/registrations", {
        params: {
          page,
          limit: PAGE_SIZE,
          ...(search ? { search } : {}),
        },
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to load registrations."
        );
      }

      const list = getRegistrationList(response.data);
      const pageInfo = getPagination(response.data, page);

      setRegistrations(list);
      setPagination({
        ...pageInfo,
        total: pageInfo.total || list.length,
      });
    } catch (err) {
      setRegistrations([]);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load registrations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

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

  const openDetails = async (registrationId) => {
    setSelectedRegistration(null);
    setDetailsError("");
    setDetailsLoading(true);

    try {
      const response = await api.get(
        `/admin/registrations/${encodeURIComponent(registrationId)}`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to load registration details."
        );
      }

      const result = response.data.data;
      setSelectedRegistration(result?.registration || result);
    } catch (err) {
      setDetailsError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load registration details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedRegistration(null);
    setDetailsError("");
  };

  const hasPreviousPage = page > 1;
  const hasNextPage = page < pagination.totalPages;

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
            <p className="admin-eyebrow">ATTENDEE MANAGEMENT</p>
            <h2>Registrations</h2>
            <p className="admin-heading-description">
              View and manage conference attendee registrations.
            </p>
          </div>

          <button
            type="button"
            className="admin-refresh-button"
            onClick={fetchRegistrations}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "admin-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <section className="admin-registration-toolbar">
          <form className="admin-search-form" onSubmit={handleSearch}>
            <Search size={18} />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search name, email, roll number or registration ID..."
              aria-label="Search registrations"
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

          <div className="admin-registration-total">
            <Users size={17} />
            <span>
              {pagination.total.toLocaleString("en-IN")} registrations
            </span>
          </div>
        </section>

        {error && (
          <div className="admin-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button type="button" onClick={fetchRegistrations}>
              Retry
            </button>
          </div>
        )}

        <section className="admin-table-panel">
          <div className="admin-table-heading">
            <div>
              <h3>Registered attendees</h3>
              <p>
                {search
                  ? `Search results for "${search}"`
                  : "All conference registrations"}
              </p>
            </div>
            <span className="admin-table-page-label">
              Page {page} of {pagination.totalPages}
            </span>
          </div>

          {loading ? (
            <div className="admin-loading-panel">
              <RefreshCw size={22} className="admin-spin" />
              <p>Loading registrations...</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="admin-empty-state">
              <Users size={30} />
              <h3>No registrations found</h3>
              <p>
                {search
                  ? "Try another search term or clear your search."
                  : "Registered attendees will appear here."}
              </p>
              {search && (
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={clearSearch}
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="admin-table-scroll">
                <table className="admin-registration-table">
                  <thead>
                    <tr>
                      <th>Attendee</th>
                      <th>Roll number</th>
                      <th>Department</th>
                      <th>Year</th>
                      <th>Registration ID</th>
                      <th>Registered on</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {registrations.map((registration) => (
                      <tr key={registration.registrationId}>
                        <td>
                          <div className="admin-attendee-cell">
                            <strong>{registration.name || "—"}</strong>
                            <span>{registration.email || "—"}</span>
                          </div>
                        </td>
                        <td>{registration.rollNumber || "—"}</td>
                        <td>{registration.department || "—"}</td>
                        <td>{registration.year || "—"}</td>
                        <td>
                          <span className="admin-id-text">
                            {registration.registrationId || "—"}
                          </span>
                        </td>
                        <td>{formatDate(registration.createdAt)}</td>
                        <td>
                          <button
                            type="button"
                            className="admin-view-button"
                            onClick={() =>
                              openDetails(registration.registrationId)
                            }
                            disabled={!registration.registrationId}
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
                  Showing {registrations.length} of{" "}
                  {pagination.total.toLocaleString("en-IN")} registrations
                </span>

                <div className="admin-pagination-actions">
                  <button
                    type="button"
                    className="admin-pagination-button"
                    disabled={!hasPreviousPage || loading}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    <ChevronLeft size={17} />
                    Previous
                  </button>

                  <span className="admin-current-page">{page}</span>

                  <button
                    type="button"
                    className="admin-pagination-button"
                    disabled={!hasNextPage || loading}
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

      {detailsLoading && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-loading">
            <RefreshCw size={22} className="admin-spin" />
            <p>Loading attendee details...</p>
          </div>
        </div>
      )}

      {detailsError && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-loading">
            <AlertCircle size={24} />
            <p>{detailsError}</p>
            <button
              type="button"
              className="admin-secondary-button"
              onClick={closeDetails}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {selectedRegistration && (
        <RegistrationDetailsModal
          registration={selectedRegistration}
          onClose={closeDetails}
        />
      )}
    </main>
  );
}
