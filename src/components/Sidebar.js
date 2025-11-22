import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import "./Sidebar.css";
const Sidebar = () => {
    const location = useLocation();
    const { theme } = useTheme();
    const menuItems = [
        { name: "Dashboard", path: "/dashboard", icon: "📊" },
        { name: "Perfil", path: "/profile", icon: "👤" }
    ];
    return (_jsxs("aside", { className: "sidebar", children: [_jsxs("div", { className: "sidebar__header", children: [_jsx("h1", { className: "sidebar__title", children: "Gest\u00E3o Financeira" }), _jsx("p", { className: "sidebar__subtitle", children: "Controle suas finan\u00E7as" })] }), _jsx("nav", { className: "sidebar__nav", children: _jsx("ul", { className: "sidebar__menu", children: menuItems.map((item) => (_jsx("li", { className: "sidebar__item", children: _jsxs(Link, { to: item.path, className: `sidebar__link ${location.pathname === item.path ? "active" : ""}`, children: [_jsx("span", { className: "sidebar__icon", children: item.icon }), _jsx("span", { className: "sidebar__text", children: item.name })] }) }, item.path))) }) }), _jsxs("div", { className: "sidebar__footer", children: [_jsxs("div", { className: "sidebar__user", children: [_jsx("div", { className: "sidebar__avatar", children: "\uD83D\uDC64" }), _jsxs("div", { className: "sidebar__user-info", children: [_jsx("p", { className: "sidebar__user-name", children: "Usu\u00E1rio" }), _jsx("p", { className: "sidebar__user-email", children: "usuario@email.com" })] })] }), _jsx("button", { className: "sidebar__toggle", children: theme === 'dark' ? '🌙' : '☀️' })] })] }));
};
export default Sidebar;
