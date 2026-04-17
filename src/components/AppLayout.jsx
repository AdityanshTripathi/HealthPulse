import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Calendar, UserCircle, Stethoscope,
  Building2, Menu, X, Activity, LogOut, Bell, ChevronRight,
  Heart, Settings, AlertTriangle
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import { toast } from 'react-hot-toast'
import '../pages/admin/AdminLayout.css'
import '../pages/doctor/DoctorLayout.css'
import '../pages/hospital/HospitalLayout.css'

const NAV_MAP = {
  patient: [
    { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/app/triage', icon: Activity, label: 'Triage' },
    { to: '/app/appointment', icon: Calendar, label: 'Appointments' },
    { to: '/app/profile', icon: UserCircle, label: 'Profile' },
  ],
  doctor: [
    { to: '/app/doctor', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/app/doctor/patients', icon: Users, label: 'My Patients' },
    { to: '/app/doctor/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/app/doctor/profile', icon: UserCircle, label: 'Profile' },
  ],
  hospital: [
    { to: '/app/hospital', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/app/hospital/patients', icon: Users, label: 'Patients' },
    { to: '/app/hospital/doctors', icon: Stethoscope, label: 'Doctors' },
    { to: '/app/hospital/appointments', icon: Calendar, label: 'Appointments' },
  ],
}

const ROLE_META = {
  patient: {
    badge: 'Patient Portal',
    badgeIcon: Heart,
    badgeColor: '#10b981',
    sidebarClass: 'doctor-sidebar', // we reuse green sidebar
    logoClass: 'doctor-logo-icon',
    avatarClass: 'doctor-avatar',
    topTitle: 'HealthPulse Dashboard',
  },
  doctor: {
    badge: 'Doctor Portal',
    badgeIcon: Stethoscope,
    badgeColor: '#059669',
    sidebarClass: 'doctor-sidebar',
    logoClass: 'doctor-logo-icon',
    avatarClass: 'doctor-avatar',
    topTitle: 'Doctor Dashboard',
  },
  hospital: {
    badge: 'Hospital Portal',
    badgeIcon: Building2,
    badgeColor: '#2563eb',
    sidebarClass: 'hospital-sidebar',
    logoClass: 'hospital-logo-icon',
    avatarClass: 'hospital-avatar',
    topTitle: 'Hospital Control Center',
  },
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [alertCount, setAlertCount] = useState(0)
  const { session, profile, role, logout } = useAuth()
  const navigate = useNavigate()

  const userRole = role || 'patient'
  const meta = ROLE_META[userRole] || ROLE_META.patient
  const links = NAV_MAP[userRole] || NAV_MAP.patient
  const BadgeIcon = meta.badgeIcon

  useEffect(() => {
    if (userRole === 'hospital' || userRole === 'doctor') {
      const channel = supabase
        .channel('app-emergency-alerts')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'cases', filter: 'severity=eq.Emergency' },
          (payload) => {
            toast.error(`🚨 EMERGENCY: ${payload.new.patient_name} — Risk ${payload.new.risk_score}/100`, { duration: 8000 })
            setAlertCount(prev => prev + 1)
          }
        )
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    }
  }, [userRole])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out.')
    navigate('/')
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <div className={`admin-shell`}>
      {/* Sidebar */}
      <aside className={`admin-sidebar ${meta.sidebarClass} ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className={`sidebar-logo-icon ${meta.logoClass}`}>
              <BadgeIcon size={18} color="#fff" />
            </div>
            <span>Health<span className="gradient-text">Pulse</span></span>
          </div>
          <button className="sidebar-close-mobile" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className={userRole === 'hospital' ? 'hospital-role-badge' : 'doctor-role-badge'}>
          <BadgeIcon size={12} />
          {meta.badge}
        </div>

        <span className="sidebar-section-label">Navigation</span>

        <nav className="sidebar-nav">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <link.icon size={18} />
              <span>{link.label}</span>
              <ChevronRight size={14} className="sidebar-arrow" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link logout-link" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="topbar-hamburger" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="topbar-title">{meta.topTitle}</div>
          <div className="topbar-actions">
            {(userRole === 'hospital' || userRole === 'doctor') && (
              <button className="topbar-icon-btn" title="Alerts" onClick={() => setAlertCount(0)}>
                <AlertTriangle size={18} />
                {alertCount > 0 && <span className="notif-dot" />}
              </button>
            )}
            <button className="topbar-icon-btn" title="Notifications">
              <Bell size={18} />
            </button>
            <div className={`topbar-avatar ${meta.avatarClass}`}>{initials}</div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
