import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import LoadingSpinner from './components/LoadingSpinner';

export const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner text="Проверка авторизации..." />;

  if (!user) return <Navigate to="/login" replace />;

  return children;
};

