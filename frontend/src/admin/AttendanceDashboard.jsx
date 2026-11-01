import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  Search,
  Users,
  Clock3,
  CalendarCheck,
  ScanLine,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  X,
  Download,
} from "lucide-react";

import { api } from "./api";
import "./admin.css";

const PAGE_SIZE = 10;

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
    second: "2-digit",
  });
};

const formatTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};


const localDayBoundary = (dateString, isEnd = false) => {
  if (!dateString) return undefined;

  const [year, month, day] = dateString.split("-").map(Number);

  const date = isEnd
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day, 0, 0, 0, 0);

  return date.toISOString();
};

const csvEscape = (value) => {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
};



export default function AttendanceDashboard() {
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [stats, setStats] = useState({
    totalCheckIns: 0,
    todayCheckIns: 0,
    latestArrival: null,
  });
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get("/admin/attendance/stats");

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to load attendance statistics.",
        );
      }

      setStats(response.data.data);
    } catch (err) {
      console.error(
        "Attendance statistics error:",
        err.response?.data || err.message,
      );
    }
  }, []);

  const exportAttendance = async () => {
    setExporting(true);
    setExportError("");

    try {
      let allRecords = [];
      let exportPage = 1;
      let exportTotalPages = 1;

      do {
        const response = await api.get("/admin/attendance", {
          params: {
            page: exportPage,
            limit: 100,
            ...(search ? { search } : {}),
            ...(appliedStartDate
              ? { startDate: localDayBoundary(appliedStartDate) }
              : {}),
            ...(appliedEndDate
              ? { endDate: localDayBoundary(appliedEndDate, true) }
              : {}),
          },
        });

        if (!response.data?.success) {
          throw new Error("Unable to retrieve attendance records for export.");
        }

        const result = response.data.data;
        allRecords = allRecords.concat(result.attendance || []);
        exportTotalPages = result.pagination?.totalPages || 1;
        exportPage += 1;
      } while (exportPage <= exportTotalPages);

      if (allRecords.length === 0) {
        throw new Error("There are no attendance records to export.");
      }

      const headers = [
        "Name",
        "Registration ID",
        "Email",
        "Roll Number",
        "Department",
        "Year",
        "Arrival Date and Time",
      ];

      const rows = allRecords.map((item) => [
        item.name,
        item.registrationId,
        item.email,
        item.rollNumber,
        item.department,
        item.year,
        item.checkedInAt
          ? new Date(item.checkedInAt).toLocaleString("en-IN")
          : "",
      ]);

      const csv = [headers, ...rows]
        .map((row) => row.map(csvEscape).join(","))
        .join("\r\n");

      const blob = new Blob(["\uFEFF", csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `conference-attendance-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err.message || "CSV export failed.");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/attendance", {
        params: {
          page,
          limit: PAGE_SIZE,
          ...(search ? { search } : {}),
          ...(appliedStartDate
            ? { startDate: localDayBoundary(appliedStartDate) }
            : {}),
          ...(appliedEndDate
            ? { endDate: localDayBoundary(appliedEndDate, true) }
            : {}),
        },
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to load attendance records.",
        );
      }

      const result = response.data?.data || {};
      const records = Array.isArray(result.attendance) ? result.attendance : [];

      const pagination = result.pagination || {};

      setAttendance(records);
      setTotal(Number(pagination.total || 0));
      setTotalPages(Math.max(1, Number(pagination.totalPages || 1)));
      setLastUpdated(new Date());
      fetchStats();
    } catch (err) {
      setAttendance([]);
      setTotal(0);
      setTotalPages(1);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load attendance records.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, appliedStartDate, appliedEndDate, fetchStats]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

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

  const currentPageArrivals = attendance.length;

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
            <p className="admin-eyebrow">EVENT CHECK-IN</p>
            <h2>Attendance Dashboard</h2>
            <p className="admin-heading-description">
              Monitor conference arrivals and manage attendee check-in records.
            </p>
          </div>

          <div className="admin-dashboard-actions">
            <button
              type="button"
              className="admin-manage-button"
              onClick={() => navigate("/admin/attendance")}
            >
              <ScanLine size={17} />
              Open QR Scanner
            </button>

            <button
              type="button"
              className="admin-refresh-button"
              onClick={fetchAttendance}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "admin-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        <section className="admin-attendance-stats">
          <article className="admin-attendance-stat-card">
            <div className="admin-attendance-stat-icon blue">
              <Users size={21} />
            </div>
            <div>
              <span>Total check-ins</span>
              <strong>
                {Number(stats.totalCheckIns || 0).toLocaleString("en-IN")}
              </strong>
              <p>All recorded attendee arrivals</p>
            </div>
          </article>

          <article className="admin-attendance-stat-card">
            <div className="admin-attendance-stat-icon green">
              <CalendarCheck size={21} />
            </div>
            <div>
              <span>Today's check-ins</span>
              <strong>
                {Number(stats.todayCheckIns || 0).toLocaleString("en-IN")}
              </strong>
              <p>Arrivals today (IST)</p>
            </div>
          </article>

          <article className="admin-attendance-stat-card">
            <div className="admin-attendance-stat-icon orange">
              <Clock3 size={21} />
            </div>
            <div>
              <span>Latest arrival</span>
              <strong className="admin-latest-arrival">
                {stats.latestArrival
                  ? formatTime(stats.latestArrival.checkedInAt)
                  : "—"}
              </strong>
              <p>
                {stats.latestArrival
                  ? stats.latestArrival.name
                  : "No arrivals recorded"}
              </p>
            </div>
          </article>
        </section>

        <section className="admin-attendance-toolbar">
          <form className="admin-search-form" onSubmit={handleSearch}>
            <Search size={18} />

            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search name, registration ID, roll number..."
              aria-label="Search attendance records"
            />

            {searchInput && (
              <button
                type="button"
                className="admin-clear-search"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}

            <button type="submit" className="admin-search-button">
              Search
            </button>
          </form>
        </section>

        <section className="admin-attendance-date-toolbar">
          <div className="admin-date-field">
            <label htmlFor="attendance-start-date">From date</label>
            <input
              id="attendance-start-date"
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>

          <div className="admin-date-field">
            <label htmlFor="attendance-end-date">To date</label>
            <input
              id="attendance-end-date"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>

          <button
            type="button"
            className="admin-search-button"
            onClick={() => {
              setPage(1);
              setAppliedStartDate(startDate);
              setAppliedEndDate(endDate);
            }}
          >
            Apply dates
          </button>

          <button
            type="button"
            className="admin-secondary-button"
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setAppliedStartDate("");
              setAppliedEndDate("");
              setPage(1);
            }}
          >
            Clear dates
          </button>

          <button
            type="button"
            className="admin-csv-export-button"
            onClick={exportAttendance}
            disabled={exporting || loading}
          >
            {exporting ? (
              <RefreshCw size={16} className="admin-spin" />
            ) : (
              <Download size={16} />
            )}
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </section>

        {exportError && (
          <div className="admin-error-banner" role="alert">
            <AlertCircle size={17} />
            <span>{exportError}</span>
          </div>
        )}

        <div className="admin-attendance-result-count">
          <CheckCircle2 size={17} />
          <span>
            {total.toLocaleString("en-IN")} attendee check-ins
            {search ? ` matching "${search}"` : ""}
          </span>
        </div>

        {error && (
          <div className="admin-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button type="button" onClick={fetchAttendance}>
              Retry
            </button>
          </div>
        )}

        <section className="admin-table-panel">
          <div className="admin-table-heading">
            <div>
              <h3>Attendance register</h3>
              <p>Latest check-ins appear first.</p>
            </div>

            <span className="admin-table-page-label">
              Page {page} of {totalPages}
            </span>
          </div>

          {loading ? (
            <div className="admin-loading-panel">
              <RefreshCw size={22} className="admin-spin" />
              <p>Loading attendance records...</p>
            </div>
          ) : attendance.length === 0 ? (
            <div className="admin-empty-state">
              <Users size={30} />
              <h3>No attendance records found</h3>
              <p>
                {search
                  ? "Try another search term."
                  : "Check-ins will appear here after attendees scan their tickets."}
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

              {!search && (
                <button
                  type="button"
                  className="admin-manage-button"
                  onClick={() => navigate("/admin/attendance")}
                >
                  <ScanLine size={16} />
                  Start checking in
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
                      <th>Registration ID</th>
                      <th>Roll number</th>
                      <th>Department</th>
                      <th>Year</th>
                      <th>Arrival date & time</th>
                      <th>Check-in status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {attendance.map((item) => (
                      <tr key={item._id || item.registrationId}>
                        <td>
                          <div className="admin-attendee-cell">
                            <strong>{item.name || "—"}</strong>
                            <span>{item.email || "—"}</span>
                          </div>
                        </td>

                        <td>
                          <span className="admin-id-text">
                            {item.registrationId || "—"}
                          </span>
                        </td>

                        <td>{item.rollNumber || "—"}</td>
                        <td>{item.department || "—"}</td>
                        <td>{item.year || "—"}</td>
                        <td>
                          <div className="admin-attendee-cell">
                            <strong>{formatDate(item.checkedInAt)}</strong>
                            <span>{formatTime(item.checkedInAt)}</span>
                          </div>
                        </td>

                        <td>
                          <span className="admin-attendance-checked-badge">
                            <CheckCircle2 size={13} />
                            Checked in
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-pagination">
                <span>
                  Showing {attendance.length} records on this page
                  {search ? ` · ${total} matching records` : ""}
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
                    disabled={page >= totalPages || loading}
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

        <p className="admin-attendance-last-updated">
          {lastUpdated
            ? `Last updated: ${formatDate(lastUpdated)}`
            : "Attendance data has not been loaded yet."}
        </p>
      </section>
    </main>
  );
}
