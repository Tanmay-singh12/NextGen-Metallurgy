import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  CheckCircle2,
  FileText,
  LogOut,
  RefreshCw,
  Users,
  XCircle,
  Clock3,
  AlertCircle,
  ScanLine,
} from "lucide-react";
import { api } from "./api";
import { useAdminAuth } from "./AdminAuthContext";
import "./admin.css";

const initialStats = {
  totalRegistrations: 0,
  totalAbstracts: 0,
  abstracts: {
    underReview: 0,
    approved: 0,
    rejected: 0,
  },
};

function StatCard({ title, value, description, icon: Icon, tone }) {
  return (
    <article className="admin-stat-card">
      <div className={`admin-stat-icon ${tone}`}>
        <Icon size={22} />
      </div>

      <div className="admin-stat-content">
        <p className="admin-stat-title">{title}</p>
        <h2 className="admin-stat-value">{value.toLocaleString("en-IN")}</h2>
        <p className="admin-stat-description">{description}</p>
      </div>
    </article>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await api.get("/admin/dashboard/stats");
      const data = response.data?.data;

      if (!response.data?.success || !data) {
        throw new Error("The dashboard returned an unexpected response.");
      }

      setStats({
        totalRegistrations: Number(data.totalRegistrations) || 0,
        totalAbstracts: Number(data.totalAbstracts) || 0,
        abstracts: {
          underReview: Number(data.abstracts?.underReview) || 0,
          approved: Number(data.abstracts?.approved) || 0,
          rejected: Number(data.abstracts?.rejected) || 0,
        },
      });
    } catch (err) {
      const status = err.response?.status;

      if (status === 401 || status === 403) {
        setError(
          "Your session may have expired or you lack dashboard access. Please sign in again.",
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load dashboard statistics. Please try again.",
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleLogout = () => {
    logout();
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

        <div className="admin-topbar-actions">
          <div className="admin-user">
            <span className="admin-user-dot" />
            <span>{admin?.email || "Administrator"}</span>
          </div>

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <section className="admin-dashboard-content">
        <div className="admin-page-heading">
          <div>
            <p className="admin-eyebrow">OVERVIEW</p>
            <h2>Dashboard</h2>
            <p className="admin-heading-description">
              Monitor conference registrations and abstract submissions.
            </p>
          </div>

          <div className="admin-dashboard-actions">
            <button
              type="button"
              className="admin-manage-button"
              onClick={() => navigate("/admin/registrations")}
            >
              <Users size={17} />
              Manage Registrations
            </button>

            <button
              type="button"
              className="admin-manage-button"
              onClick={() => navigate("/admin/attendance")}
            >
              <ScanLine size={17} />
              Attendance Scanner
            </button>

            <button
              type="button"
              className="admin-manage-button"
              onClick={() => navigate("/admin/attendance/dashboard")}
            >
              <Users size={17} />
              Attendance Dashboard
            </button>

            <button
              type="button"
              className="admin-manage-button"
              onClick={() => navigate("/admin/abstracts")}
            >
              <FileText size={17} />
              Manage Abstracts
            </button>

            <button
              type="button"
              className="admin-refresh-button"
              onClick={() => fetchStats(true)}
              disabled={loading || refreshing}
            >
              <RefreshCw size={16} className={refreshing ? "admin-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh data"}
            </button>
          </div>
        </div>

        {error && (
          <div className="admin-error-banner" role="alert">
            <AlertCircle size={19} />
            <span>{error}</span>
            <button type="button" onClick={() => fetchStats(true)}>
              Retry
            </button>
          </div>
        )}

        <div className="admin-section-heading">
          <h3>Conference statistics</h3>
          <span className="admin-live-label">
            <span />
            Live data
          </span>
        </div>

        {loading ? (
          <div className="admin-loading-panel" role="status">
            <RefreshCw size={22} className="admin-spin" />
            <p>Loading dashboard statistics...</p>
          </div>
        ) : (
          <>
            <div className="admin-stats-grid">
              <StatCard
                title="Total Registrations"
                value={stats.totalRegistrations}
                description="Registered attendees"
                icon={Users}
                tone="blue"
              />

              <StatCard
                title="Total Abstracts"
                value={stats.totalAbstracts}
                description="Submitted abstracts"
                icon={FileText}
                tone="purple"
              />

              <StatCard
                title="Under Review"
                value={stats.abstracts.underReview}
                description="Awaiting a decision"
                icon={Clock3}
                tone="amber"
              />

              <StatCard
                title="Approved"
                value={stats.abstracts.approved}
                description="Approved submissions"
                icon={CheckCircle2}
                tone="green"
              />

              <StatCard
                title="Rejected"
                value={stats.abstracts.rejected}
                description="Rejected submissions"
                icon={XCircle}
                tone="red"
              />
            </div>

            <section className="admin-summary-panel">
              <div className="admin-summary-header">
                <div className="admin-summary-icon">
                  <Activity size={20} />
                </div>
                <div>
                  <h3>Abstract review summary</h3>
                  <p>Current status of all submitted abstracts</p>
                </div>
              </div>

              <div
                className="admin-progress-track"
                aria-label="Abstract review distribution"
              >
                {stats.totalAbstracts > 0 ? (
                  <>
                    <div
                      className="admin-progress-segment approved"
                      style={{
                        width: `${(stats.abstracts.approved / stats.totalAbstracts) * 100}%`,
                      }}
                    />
                    <div
                      className="admin-progress-segment under-review"
                      style={{
                        width: `${(stats.abstracts.underReview / stats.totalAbstracts) * 100}%`,
                      }}
                    />
                    <div
                      className="admin-progress-segment rejected"
                      style={{
                        width: `${(stats.abstracts.rejected / stats.totalAbstracts) * 100}%`,
                      }}
                    />
                  </>
                ) : (
                  <div className="admin-progress-empty" />
                )}
              </div>

              <div className="admin-summary-legend">
                <span>
                  <i className="legend-dot approved" />
                  Approved ({stats.abstracts.approved})
                </span>
                <span>
                  <i className="legend-dot under-review" />
                  Under review ({stats.abstracts.underReview})
                </span>
                <span>
                  <i className="legend-dot rejected" />
                  Rejected ({stats.abstracts.rejected})
                </span>
              </div>
            </section>
          </>
        )}

        <p className="admin-dashboard-note">
          Statistics are loaded from the conference backend. Use Refresh data to
          fetch the latest counts.
        </p>
      </section>
    </main>
  );
}
