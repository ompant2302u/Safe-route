import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";

import HomePage from "./pages/HomePage";
import RoutePage from "./pages/RoutePage";
import ReportHazardPage from "./pages/ReportHazardPage";
import IncidentDetailsPage from "./pages/IncidentDetailsPage";
import SafePlacesPage from "./pages/SafePlacesPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={<HomePage />}
          />

          <Route
            path="/route"
            element={<RoutePage />}
          />

          <Route
            path="/report"
            element={<ReportHazardPage />}
          />

          <Route
            path="/safe-places"
            element={<SafePlacesPage />}
          />

          <Route
            path="/incidents/:id"
            element={<IncidentDetailsPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}