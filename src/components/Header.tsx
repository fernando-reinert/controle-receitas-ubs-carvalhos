import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Menu, 
  ChevronRight,
  User,
  Pill,
  FileText,
  ClipboardList,
  Plus,
  Settings,
  LogOut
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
  user?: {
    name: string;
    avatar?: string;
  };
}

export const Header = ({ onMenuClick, user }: HeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Atualiza o relógio a cada minuto
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Mapeamento completo de breadcrumbs para todas as rotas
  const getCustomBreadcrumbs = () => {
    const path = location.pathname;
    
    // Mapeamento de ícones e nomes para cada rota
    const routeMap: Record<string, {icon: JSX.Element, name: string}> = {
      '/': { icon: <Home className="w-4 h-4" />, name: 'Inicio' },
      '/patients': { icon: <User className="w-4 h-4" />, name: 'Pacientes' },
      '/prescriptions': { icon: <FileText className="w-4 h-4" />, name: 'Receitas' },
      '/reports': { icon: <ClipboardList className="w-4 h-4" />, name: 'Relatórios' },
    };

    // Rota: /medications/:patientId (Ver receitas)
    if (path.startsWith('/medications/')) {
      return [
        { path: '/', ...routeMap['/'] },
        { path: '/patients', ...routeMap['/patients'] },
        { path, icon: <Pill className="w-4 h-4" />, name: 'Medicamentos' }
      ];
    }

    // Rota: /patients/:patientId/prescriptions/new (Nova receita)
    if (path.includes('/prescriptions/new')) {
      return [
        { path: '/', ...routeMap['/'] },
        { path: '/patients', ...routeMap['/patients'] },
        { path, icon: <Plus className="w-4 h-4" />, name: 'Nova Receita' }
      ];
    }

    // Rota: /patients/:patientId/prescriptions/edit/:id (Editar receita)
    if (path.includes('/prescriptions/edit/')) {
      return [
        { path: '/', ...routeMap['/'] },
        { path: '/patients', ...routeMap['/patients'] },
        { path, icon: <FileText className="w-4 h-4" />, name: 'Editar Receita' }
      ];
    }

    // Rotas diretas (dashboard, pacientes, receitas, relatórios)
    if (routeMap[path]) {
      return [
        { path: '/', ...routeMap['/'] },
        { path, ...routeMap[path] }
      ];
    }

    // Rota padrão (caso não encontre)
    return [
      { path: '/', icon: <Home className="w-4 h-4" />, name: 'Dashboard' },
      { path, icon: <User className="w-4 h-4" />, name: 'Página Atual' }
    ];
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Lado esquerdo - Menu e Breadcrumbs */}
          <div className="flex items-center">
            <button 
              onClick={onMenuClick}
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
              aria-label="Abrir menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            <nav className="flex items-center ml-4 space-x-2">
              {getCustomBreadcrumbs().map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />}
                  <button
                    onClick={() => navigate(crumb.path)}
                    className={`text-sm flex items-center ${
                      index === getCustomBreadcrumbs().length - 1 
                        ? 'font-medium text-gray-900' 
                        : 'text-gray-500 hover:text-gray-700 hover:underline'
                    }`}
                  >
                    {index === 0 ? crumb.icon : null}
                    <span className={`${index === 0 ? 'ml-1' : ''}`}>{crumb.name}</span>
                  </button>
                </div>
              ))}
            </nav>
          </div>

          {/* Lado direito - Relógio e User Menu */}
          <div className="flex items-center space-x-4">
            {/* Relógio */}
            <div className="hidden lg:block text-sm text-gray-500">
              {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>

            {/* Perfil do usuário */}
            <div className="relative ml-4">
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 focus:outline-none"
                aria-expanded={showUserDropdown}
                aria-label="Menu do usuário"
              >
                {user?.avatar ? (
                  <img 
                    className="h-8 w-8 rounded-full" 
                    src={user.avatar} 
                    alt={`Avatar de ${user.name}`} 
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {/* Dropdown do usuário */}
              {showUserDropdown && (
                <div 
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  onMouseLeave={() => setShowUserDropdown(false)}
                >
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setShowUserDropdown(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações
                    </button>
                    <button
                      onClick={() => {
                        // Implementar logout
                        console.log('Logout');
                        setShowUserDropdown(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};