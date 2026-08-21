import {
  LayoutDashboard,
  LogOut,
  ShieldAlert,
} from "lucide-react";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  clearAdminToken,
} from "../../services/adminService";

export default function AdminLayout() {
  const navigate =
    useNavigate();

  function logout() {
    clearAdminToken();

    navigate(
      "/admin/login",
      {
        replace: true,
      }
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-icon">
            <ShieldAlert
              size={22}
            />
          </span>

          <div>
            <strong>
              SafeRoute Nepal
            </strong>

            <span>
              Administration
            </span>
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink
            to="/admin"
            end
          >
            <LayoutDashboard
              size={18}
            />

            Dashboard
          </NavLink>

          <NavLink
            to="/admin/reports"
          >
            <ShieldAlert
              size={18}
            />

            Hazard Reports
          </NavLink>
        </nav>

        <button
          type="button"
          className="admin-logout"
          onClick={logout}
        >
          <LogOut
            size={18}
          />

          Logout
        </button>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}