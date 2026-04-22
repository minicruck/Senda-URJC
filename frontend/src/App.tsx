import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import RouteRequestPage from "./pages/RouteRequestPage";
import TripPage from "./pages/TripPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import SecurityPage from "./pages/SecurityPage";
import MaintenancePage from "./pages/MaintenancePage";
import IncidentReportPage from "./pages/IncidentReportPage";
import StatsPage from "./pages/StatsPage";
import { useAuth } from "./auth/AuthContext";
import { rolePath } from "./types/incidents";
import { useDataRetention } from "./services/retention";

function RoleHome() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "user") return <HomePage />;
  return <Navigate to={rolePath(user.role)} replace />;
}

export default function App() {
  // Purge expired tickets and alerts on mount and then hourly (RNF-18).
  useDataRetention();

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<RoleHome />} />

            <Route element={<RoleGuard allowedRoles={["user"]} />}>
              <Route path="/routes" element={<RouteRequestPage />} />
              <Route path="/trip" element={<TripPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/incidents/new" element={<IncidentReportPage />} />
            </Route>

            <Route element={<RoleGuard allowedRoles={["admin"]} />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/stats" element={<StatsPage />} />
            </Route>

            <Route element={<RoleGuard allowedRoles={["security"]} />}>
              <Route path="/security" element={<SecurityPage />} />
            </Route>

            <Route element={<RoleGuard allowedRoles={["maintenance"]} />}>
              <Route path="/maintenance" element={<MaintenancePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
