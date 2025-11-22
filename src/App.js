import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route } from 'react-router-dom';
import AuthContainer from './AuthContainer';
import ProtectedRoute from './routes/ProtectedRoute';
import ProtectedLayout from './layouts/ProtectedLayout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';
function App() {
    return (_jsx(ThemeProvider, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(AuthContainer, {}) }), _jsx(Route, { element: _jsx(ProtectedRoute, {}), children: _jsxs(Route, { element: _jsx(ProtectedLayout, {}), children: [_jsx(Route, { path: "/dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/transactions", element: _jsx(Transactions, {}) }), _jsx(Route, { path: "/profile", element: _jsx(Profile, {}) })] }) })] }) }));
}
export default App;
