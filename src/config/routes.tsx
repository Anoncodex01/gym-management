import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { MemberHome } from '../pages/dashboard/MemberHome';
import { AdminHome } from '../pages/dashboard/AdminHome';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? element : <Navigate to="/login" />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Private Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute
            element={<MemberHome />}
          />
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute
            element={<AdminHome />}
          />
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};