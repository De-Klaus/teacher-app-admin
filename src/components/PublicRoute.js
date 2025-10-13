import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Показываем loading пока проверяем аутентификацию
  if (loading) {
    return null; // Или можно показать спиннер
  }

  // Если пользователь уже авторизован, перенаправляем на главную
  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
