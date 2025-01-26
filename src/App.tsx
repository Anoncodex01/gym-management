import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminLayout } from './components/admin/AdminLayout';
import { Login } from './pages/auth/Login';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from './components/ProtectedRoute';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { MembersPage } from './pages/admin/Members';
import { ClassesPage } from './pages/admin/Classes';
import { SubscriptionsPage } from './pages/admin/Subscriptions';
import { AttendancePage } from './pages/admin/Attendance';
import { SchedulePage } from './pages/admin/Schedule';
import { NotificationsPage } from './pages/admin/Notifications';
import { SettingsPage } from './pages/admin/Settings';
import { PaymentsPage } from './pages/admin/Payments';
import { HolidayPage } from './pages/admin/Holiday';
import { BirthdayPage } from './pages/admin/Birthday';
import { MemberSignInPage } from './pages/admin/MemberSignIn';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/members"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <MembersPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/classes"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ClassesPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/subscriptions"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <SubscriptionsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AttendancePage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <PaymentsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/schedule"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <SchedulePage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <NotificationsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <SettingsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/holiday"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <HolidayPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/birthday"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <BirthdayPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/member-signin"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <MemberSignInPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
};

export default App;