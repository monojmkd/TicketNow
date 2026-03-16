import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { useEventPolling } from "./hooks/useEventPolling";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EventsPage from "./pages/EventsPage";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import MyBookingsPage from "./pages/MyBookingsPage";

function PollingManager() {
  useEventPolling();
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <PollingManager />
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<EventsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Organizer only */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="organizer">
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Customer only */}
          <Route
            path="/bookings"
            element={
              <ProtectedRoute role="customer">
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
