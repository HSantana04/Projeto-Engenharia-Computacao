import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// ========== ROTA PROTEGIDA ==========
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Aguardar carregar dados do localStorage
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  // Se não autenticado, redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se autenticado, mostrar página
  return <>{children}</>;
};

// ========== ROTA PÚBLICA ==========
export const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Aguardar carregar
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  // Se já autenticado, redirecionar para dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Se não autenticado, mostrar página
  return <>{children}</>;
};