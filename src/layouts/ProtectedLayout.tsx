import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../contexts/ThemeContext";
import "./ProtectedLayout.css";

const ProtectedLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { theme, toggle } = useTheme();

  // Fechar sidebar em mobile quando mudar de rota
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // Fechar sidebar quando clicar no overlay
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  // Determinar título da página baseado na rota
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/profile':
        return 'Meu Perfil';
      default:
        return 'Gestão Financeira';
    }
  };

  return (
    <div className="protected-layout">
      {/* Overlay para mobile */}
      <div 
        className={`protected-layout__overlay ${sidebarOpen ? 'protected-layout__overlay--visible' : ''}`}
        onClick={handleOverlayClick}
      />
      
      {/* Sidebar */}
      <div className={`protected-layout__sidebar ${sidebarOpen ? 'protected-layout__sidebar--open' : ''}`}>
        <Sidebar />
      </div>

      {/* Conteúdo principal */}
      <div className="protected-layout__content">
        {/* Header */}
        <header className="protected-layout__header">
          <h1 className="protected-layout__header-title">{getPageTitle()}</h1>
          <div className="protected-layout__header-actions">
            <button 
              className="protected-layout__mobile-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <button 
              onClick={toggle}
              className="protected-layout__mobile-toggle"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
          </div>
        </header>

        {/* Conteúdo da página */}
        <main className="protected-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;