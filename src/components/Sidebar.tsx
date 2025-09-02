import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import "./Sidebar.css";

const Sidebar: React.FC = () => {
    const location = useLocation();
    const { theme } = useTheme();

    const menuItems = [
        { name: "Dashboard", path: "/dashboard", icon: "📊" },
        { name: "Perfil", path: "/profile", icon: "👤" }
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar__header">
                <h1 className="sidebar__title">Gestão Financeira</h1>
                <p className="sidebar__subtitle">Controle suas finanças</p>
            </div>
            
            <nav className="sidebar__nav">
                <ul className="sidebar__menu">
                    {menuItems.map((item) => (
                        <li key={item.path} className="sidebar__item">
                            <Link
                                to={item.path}
                                className={`sidebar__link ${location.pathname === item.path ? "active" : ""}`}
                            >
                                <span className="sidebar__icon">{item.icon}</span>
                                <span className="sidebar__text">{item.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            
            <div className="sidebar__footer">
                <div className="sidebar__user">
                    <div className="sidebar__avatar">
                        👤
                    </div>
                    <div className="sidebar__user-info">
                        <p className="sidebar__user-name">Usuário</p>
                        <p className="sidebar__user-email">usuario@email.com</p>
                    </div>
                </div>
                <button className="sidebar__toggle">
                    {theme === 'dark' ? '🌙' : '☀️'}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;