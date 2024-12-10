import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PrivateRoutes = () => {
  const { isAuth } = useAuth();

  return isAuth ? (
    <Outlet />
  ) : (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Access Denied</h1>
      <p>You must be logged in to view this page.</p>
      <a href="/login">Go to Login</a>
    </div>
  );
};


export default PrivateRoutes;
