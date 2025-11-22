import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute, PublicRoute } from './routes/ProtectedRoute';

// Pages
import Login from './Login';
import SignUp from './SignUp';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* ROTA RAIZ */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* ROTAS PÚBLICAS */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login onSwitchToSignUp={() => {}} onSwitchToForgotPassword={() => {}} />
                </PublicRoute>
              }
            />

            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignUp onSwitchToLogin={() => {}} />
                </PublicRoute>
              }
            />

            {/* ROTAS PROTEGIDAS */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* ROTAS DE FALLBACK */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
