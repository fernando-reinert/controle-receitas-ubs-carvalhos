import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  FileText,
  BarChart2,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Header } from './Header'; // importe o Header aqui

export const Layout = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="relative min-h-screen bg-gray-100">
      {/* Header com botão de menu e breadcrumb */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* Overlay escuro ao fundo */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar deslizante */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Botão de fechar */}
        <div className="flex justify-end p-4">
          <button onClick={closeSidebar}>
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="px-6">
          <h1 className="text-2xl font-bold text-gray-800">Controle de Receitas</h1>
          <p className="text-sm text-gray-600 mt-1">Sistema de Receitas</p>
        </div>

        <nav className="mt-6">
          <Link to="/" onClick={closeSidebar} className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <Home className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link to="/patients" onClick={closeSidebar} className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <Users className="w-5 h-5 mr-3" />
            Pacientes
          </Link>
          <Link to="/prescriptions" onClick={closeSidebar} className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <FileText className="w-5 h-5 mr-3" />
            Receitas
          </Link>
          <Link to="/reports" onClick={closeSidebar} className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <BarChart2 className="w-5 h-5 mr-3" />
            Relatórios
          </Link>
        </nav>

        <div className="absolute bottom-0 w-full p-6">
          <div className="flex items-center mb-4">
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.email}</p>
              <p className="text-xs text-gray-500">{user?.role === 'admin' ? 'Administrador' : 'Agente'}</p>
            </div>
          </div>
          <button
            onClick={async () => {
              closeSidebar();
              await handleSignOut();
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sair
          </button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="p-8">
        <Outlet />
      </div>
    </div>
  );
};
