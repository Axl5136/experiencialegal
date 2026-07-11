import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import Landing from './components/Landing'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Placeholder from './components/Common/Placeholder'
import RequireAuth from './components/Common/RequireAuth'

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard/:role"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route path="/admin" element={<Placeholder title="Admin Login" />} />
            <Route path="/admin/dashboard" element={<Placeholder title="Admin Dashboard" />} />
            <Route path="/admin/expediente/:id" element={<Placeholder title="Expediente" />} />
            <Route path="/cliente/:hash" element={<Placeholder title="Acceso Cliente" />} />
            <Route path="*" element={<Placeholder title="404 - Página no encontrada" />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App
