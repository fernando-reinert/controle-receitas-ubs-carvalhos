import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode; // Aceita qualquer conteúdo como filhos
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>; // Exibe uma mensagem enquanto carrega o estado de autenticação
  }

  if (!user) {
    return <Navigate to="/login" />; // Redireciona para o login se o usuário não estiver autenticado
  }

  return <>{children}</>; // Retorna os filhos se o usuário estiver autenticado
};
