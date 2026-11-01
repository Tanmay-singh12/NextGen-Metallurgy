import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import RegistrationManagement from "./admin/RegistrationManagement";
import ProtectedAdminRoute from "./admin/ProtectedAdminRoute";
import { AdminAuthProvider } from "./admin/AdminAuthContext";
import AbstractManagement from "./admin/AbstractManagement";
import AttendanceScanner from "./admin/AttendanceScanner";
import AttendanceDashboard from "./admin/AttendanceDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected admin routes */}

          <Route element={<ProtectedAdminRoute />}>
            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />

            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            <Route
              path="/admin/registrations"
              element={<RegistrationManagement />}
            />

            <Route path="/admin/abstracts" element={<AbstractManagement />} />

            <Route path="/admin/attendance" element={<AttendanceScanner />} />

            <Route
              path="/admin/attendance/dashboard"
              element={<AttendanceDashboard />}
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}
