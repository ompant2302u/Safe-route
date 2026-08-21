import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  AdminApiError,
  getPendingReports,
} from "../../services/adminService";

import "./Admin.css";

export default function AdminDashboardPage() {
  const navigate =
    useNavigate();

  const [
    pendingCount,
    setPendingCount,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  useEffect(() => {
    async function load() {
      try {
        const reports =
          await getPendingReports();

        setPendingCount(
          reports.length
        );
      } catch (loadError) {
        if (
          loadError instanceof
            AdminApiError &&
          loadError.status === 401
        ) {
          navigate(
            "/admin/login",
            {
              replace: true,
            }
          );

          return;
        }

        setError(
          loadError instanceof
            Error
            ? loadError.message
            : "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [navigate]);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-eyebrow">
            Administration
          </span>

          <h1>
            Dashboard
          </h1>

          <p>
            Review community reports
            before they become trusted
            hazard information.
          </p>
        </div>
      </div>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      <div className="admin-stat-grid">
        <article className="admin-stat-card">
          <ClipboardList
            size={24}
          />

          <span>
            Pending Reports
          </span>

          <strong>
            {loading
              ? "..."
              : pendingCount}
          </strong>
        </article>

        <article className="admin-stat-card">
          <AlertTriangle
            size={24}
          />

          <span>
            Needs Review
          </span>

          <strong>
            {loading
              ? "..."
              : pendingCount}
          </strong>
        </article>

        <article className="admin-stat-card">
          <ShieldCheck
            size={24}
          />

          <span>
            Verification
          </span>

          <strong>
            Active
          </strong>
        </article>
      </div>

      <section className="admin-action-card">
        <div>
          <h2>
            Pending Hazard Reports
          </h2>

          <p>
            Review location, severity
            and report details before
            verifying or rejecting.
          </p>
        </div>

        <Link
          to="/admin/reports"
          className="admin-primary-link"
        >
          Review Reports
        </Link>
      </section>
    </div>
  );
}