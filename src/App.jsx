import { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Triage from './pages/Triage'
import Results from './pages/Results'
import Doctors from './pages/Doctors'
import Hospitals from './pages/Hospitals'
import Emergency from './pages/Emergency'
import Dashboard from './pages/Dashboard'
import Appointment from './pages/Appointment'
import Consult from './pages/Consult'
import AuthModal from './components/AuthModal'
import AppLayout from './components/AppLayout'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './lib/AuthContext'

// Admin imports
import AdminLayout from './pages/admin/AdminLayout'
import DashboardOverview from './pages/admin/DashboardOverview'
import PatientManagement from './pages/admin/PatientManagement'
import DoctorManagement from './pages/admin/DoctorManagement'
import HospitalManagement from './pages/admin/HospitalManagement'
import AppointmentManagement from './pages/admin/AppointmentManagement'

// Doctor page components (reused inside /app/doctor/*)
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorPatients from './pages/doctor/DoctorPatients'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import DoctorProfile from './pages/doctor/DoctorProfile'

// Hospital page components (reused inside /app/hospital/*)
import HospitalDashboard from './pages/hospital/HospitalDashboard'
import HospitalPatients from './pages/hospital/HospitalPatients'
import HospitalDoctors from './pages/hospital/HospitalDoctors'
import HospitalAppointments from './pages/hospital/HospitalAppointments'

function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState('login')
  const { session, role, loading } = useAuth()
  const location = useLocation()

  const openAuth = (tab = 'login') => {
    setAuthTab(tab)
    setIsAuthOpen(true)
  }

  // Route protection components
  const ProtectedRoute = ({ children }) => {
    if (loading) return null
    if (!session) return <Navigate to="/" replace />
    return children
  }

  const RoleGate = ({ allowed, children }) => {
    if (loading) return null
    if (!session) return <Navigate to="/" replace />
    if (allowed && !allowed.includes(role)) {
      // Redirect to appropriate dashboard based on actual role
      if (role === 'admin') return <Navigate to="/admin" replace />
      if (role === 'doctor') return <Navigate to="/app/doctor" replace />
      if (role === 'hospital') return <Navigate to="/app/hospital" replace />
      return <Navigate to="/app/dashboard" replace />
    }
    return children
  }

  // Hide navbar on /app and /admin routes
  const isPortalRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/app')

  return (
    <div className="app">
      <Toaster position="top-right" />
      {!isPortalRoute && <Navbar session={session} onAuthClick={openAuth} />}

      <Routes>
        {/* ─── Public Routes ─── */}
        <Route path="/" element={<Landing onAuthClick={openAuth} session={session} />} />
        <Route path="/triage" element={<Triage />} />
        <Route path="/results" element={<Results />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/appointment" element={<Appointment />} />
        <Route path="/consult" element={<Consult />} />

        {/* Legacy /dashboard redirect → /app/dashboard */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />

        {/* ─── Unified App Portal (/app/*) ─── */}
        <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          {/* Patient routes */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="triage" element={<Triage />} />
          <Route path="appointment" element={<Appointment />} />
          <Route path="profile" element={<DoctorProfile />} />

          {/* Doctor routes (role-gated) */}
          <Route path="doctor" element={<RoleGate allowed={['doctor']}><DoctorDashboard /></RoleGate>} />
          <Route path="doctor/patients" element={<RoleGate allowed={['doctor']}><DoctorPatients /></RoleGate>} />
          <Route path="doctor/appointments" element={<RoleGate allowed={['doctor']}><DoctorAppointments /></RoleGate>} />
          <Route path="doctor/profile" element={<RoleGate allowed={['doctor']}><DoctorProfile /></RoleGate>} />

          {/* Hospital routes (role-gated) */}
          <Route path="hospital" element={<RoleGate allowed={['hospital']}><HospitalDashboard /></RoleGate>} />
          <Route path="hospital/patients" element={<RoleGate allowed={['hospital']}><HospitalPatients /></RoleGate>} />
          <Route path="hospital/doctors" element={<RoleGate allowed={['hospital']}><HospitalDoctors /></RoleGate>} />
          <Route path="hospital/appointments" element={<RoleGate allowed={['hospital']}><HospitalAppointments /></RoleGate>} />

          {/* Default redirect based on role */}
          <Route index element={
            role === 'doctor' ? <Navigate to="/app/doctor" replace /> :
            role === 'hospital' ? <Navigate to="/app/hospital" replace /> :
            <Navigate to="/app/dashboard" replace />
          } />
        </Route>

        {/* ─── Admin Panel (Separate) ─── */}
        <Route path="/admin" element={
          <RoleGate allowed={['admin']}>
            <AdminLayout />
          </RoleGate>
        }>
          <Route index element={<DashboardOverview />} />
          <Route path="patients" element={<PatientManagement />} />
          <Route path="doctors" element={<DoctorManagement />} />
          <Route path="hospitals" element={<HospitalManagement />} />
          <Route path="appointments" element={<AppointmentManagement />} />
        </Route>
      </Routes>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab={authTab}
      />
    </div>
  )
}

export default App
