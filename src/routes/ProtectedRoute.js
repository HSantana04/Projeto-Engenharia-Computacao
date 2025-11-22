import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
function ProtectedRoute() {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return _jsx(Outlet, {});
}
export default ProtectedRoute;
