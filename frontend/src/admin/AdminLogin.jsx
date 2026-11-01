
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "./AdminAuthContext";
import "./admin.css";

export default function AdminLogin() {
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);

      const destination = location.state?.from?.pathname;
      navigate(
        destination?.startsWith("/admin") &&
          destination !== "/admin/login"
          ? destination
          : "/admin/dashboard",
        { replace: true }
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to sign in. Check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="admin-brand-mark">
          <ShieldCheck size={30} />
        </div>

        <p className="admin-eyebrow">COALESCENCE · MME 2026</p>
        <h1>Admin Portal</h1>
        <p className="admin-muted">
          Sign in to manage registrations and abstract submissions.
        </p>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <label htmlFor="admin-email">Email address</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
            required
          />

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
          />

          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            <LockKeyhole size={17} />
            {loading ? "Signing in..." : "Sign in securely"}
          </button>
        </form>

        <Link to="/" className="admin-back-link">
          Back to conference website
        </Link>
      </section>
    </main>
  );
}
