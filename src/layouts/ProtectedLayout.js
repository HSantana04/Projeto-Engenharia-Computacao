import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../contexts/ThemeContext";
import "./ProtectedLayout.css";
const ProtectedLayout = () => {
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
    return (_jsxs("div", { className: "protected-layout", children: [_jsx("div", { className: `protected-layout__overlay ${sidebarOpen ? 'protected-layout__overlay--visible' : ''}`, onClick: handleOverlayClick }), _jsx("div", { className: `protected-layout__sidebar ${sidebarOpen ? 'protected-layout__sidebar--open' : ''}`, children: _jsx(Sidebar, {}) }), _jsxs("div", { className: "protected-layout__content", children: [_jsxs("header", { className: "protected-layout__header", children: [_jsx("h1", { className: "protected-layout__header-title", children: getPageTitle() }), _jsxs("div", { className: "protected-layout__header-actions", children: [_jsx("button", { className: "protected-layout__mobile-toggle", onClick: () => setSidebarOpen(!sidebarOpen), "aria-label": "Toggle sidebar", children: "\u2630" }), _jsx("button", { onClick: toggle, className: "protected-layout__mobile-toggle", "aria-label": "Toggle theme", children: theme === 'dark' ? '🌙' : '☀️' })] })] }), _jsx("main", { className: "protected-layout__main", children: _jsx(Outlet, {}) })] })] }));
};
export default ProtectedLayout;
