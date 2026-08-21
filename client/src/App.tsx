import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout
  from "./components/layout/AppLayout";

import AdminLayout
  from "./components/admin/AdminLayout";

import ProtectedAdminRoute
  from "./components/admin/ProtectedAdminRoute";

import HomePage
  from "./pages/HomePage";

import RoutePage
  from "./pages/RoutePage";

import ReportHazardPage
  from "./pages/ReportHazardPage";

import IncidentDetailsPage
  from "./pages/IncidentDetailsPage";

import SafePlacesPage
  from "./pages/SafePlacesPage";

import AdminLoginPage
  from "./pages/admin/AdminLoginPage";

import AdminDashboardPage
  from "./pages/admin/AdminDashboardPage";

import AdminReportsPage
  from "./pages/admin/AdminReportsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================
            PUBLIC APPLICATION
        ========================= */}

        <Route
          element={
            <AppLayout />
          }
        >
          <Route
            path="/"
            element={
              <HomePage />
            }
          />

          <Route
            path="/route"
            element={
              <RoutePage />
            }
          />

          <Route
            path="/report"
            element={
              <ReportHazardPage />
            }
          />

          <Route
            path="/safe-places"
            element={
              <SafePlacesPage />
            }
          />

          <Route
            path="/incidents/:id"
            element={
              <IncidentDetailsPage />
            }
          />
        </Route>

        {/* =========================
            ADMIN LOGIN
        ========================= */}

        <Route
          path="/admin/login"
          element={
            <AdminLoginPage />
          }
        />

        {/* =========================
            PROTECTED ADMIN AREA
        ========================= */}

        <Route
          element={
            <ProtectedAdminRoute />
          }
        >
          <Route
            path="/admin"
            element={
              <AdminLayout />
            }
          >
            <Route
              index
              element={
                <AdminDashboardPage />
              }
            />

            <Route
              path="reports"
              element={
                <AdminReportsPage />
              }
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
