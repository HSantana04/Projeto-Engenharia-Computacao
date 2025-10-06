import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthContainer from './AuthContainer'
import ProtectedRoute from './routes/ProtectedRoute'
import ProtectedLayout from './layouts/ProtectedLayout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Profile from './pages/Profile'
import { ThemeProvider } from './contexts/ThemeContext'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/*Rota pública*/}
          <Route path="/" element={<AuthContainer />} />

          {/*Rotas protegida*/}
          <Route element={<ProtectedRoute />}>
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App