import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const RoleProtectedLayout = ({ allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) return <Navigate to="/signin" replace />;

  const userRole = user.role?.toLowerCase();
  const normalizedAllowed = allowedRoles.map(role => role.toLowerCase());

  if (!normalizedAllowed.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RoleProtectedLayout;
