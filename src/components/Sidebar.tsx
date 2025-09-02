import { Link, useLocation } from "react-router-dom";

const Sidebar: React.FC = () => {
    const location = useLocation();

    const menuItems = [
        { name: "Dashboard", path: "/dashboard", icon: "fa-solid fa-chart-line" },
        { name: "Profile", path: "/profile", icon: "fa-solid fa-user" }
    ];

    return (
        <div className="h-screen w-64 bg-gray-900 text-white flex flex-col p-4">
            <h2 className="text-2xl font-bold mb-8">Meu App</h2>
            <nav className="flex flex-col gap-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`p-2 rounded hover:bg-gray-700 ${location.pathname === item.path ? "bg-gray-700" : ""
                            }`}
                    >
                        {item.name}
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;