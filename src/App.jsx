import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import Landing from './components/Landing'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import ClientePrivado from './components/ClientePrivado'
import AdminLogin from './components/Admin/AdminLogin'
import AdminDashboard from './components/Admin/AdminDashboard'
import ExpedienteForm from './components/Admin/ExpedienteForm'
import ExpedienteDetail from './components/Admin/ExpedienteDetail'
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
            <Route path="/admin" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <RequireAuth role="lawyer" redirectTo="/admin">
                  <AdminDashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/expediente/nuevo"
              element={
                <RequireAuth role="lawyer" redirectTo="/admin">
                  <ExpedienteForm />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/expediente/:id"
              element={
                <RequireAuth role="lawyer" redirectTo="/admin">
                  <ExpedienteDetail />
                </RequireAuth>
              }
            />
            <Route path="/cliente/:hash" element={<ClientePrivado />} />
            <Route path="*" element={<Placeholder title="404 - Página no encontrada" />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App
