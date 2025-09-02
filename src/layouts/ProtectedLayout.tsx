import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const ProtectedLayout: React.FC = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar fixa */}
      <Sidebar />

      {/* Conteúdo da página */}
      <div className="flex-1 bg-gray-100 p-6 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default ProtectedLayout;