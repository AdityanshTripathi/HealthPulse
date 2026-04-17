import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Calendar, UserCircle,
  Menu, X, Activity, LogOut, Bell, ChevronRight, Stethoscope
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'react-hot-toast'
import '../admin/AdminLayout.css'
import './DoctorLayout.css'

const sidebarLinks = [
  { to: '/doctor', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/doctor/patients', icon: Users, label: 'My Patients' },
  { to: '/doctor/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/doctor/profile', icon: UserCircle, label: 'Profile' },
]

export default function DoctorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [alerts, setAlerts] = useState([])
  const navigate = useNavigate()

  // Real-time subscription for new emergency cases
  useEffect(() => {
    const channel = supabase
      .channel('doctor-emergency-alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'cases', filter: 'severity=eq.Emergency' },
        (payload) => {
          const c = payload.new
          toast.error(`🚨 EMERGENCY: ${c.patient_name} — Risk ${c.risk_score}/100`, { duration: 8000 })
          setAlerts(prev => [c, ...prev])
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'cases' },
        () => {
          // Trigger a re-render hint for child pages
          window.dispatchEvent(new Event('case-updated'))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out.')
    navigate('/')
  }

  return (
    <div className="admin-shell doctor-shell">
      {/* Sidebar */}
      <aside className={`admin-sidebar doctor-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo-icon doctor-logo-icon">
              <Stethoscope size={18} color="#fff" />
            </div>
            <span>Health<span className="gradient-text">Pulse</span></span>
          </div>
          <button className="sidebar-close-mobile" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="doctor-role-badge">
          <Activity size={12} />
          Doctor Portal
        </div>

        <span className="sidebar-section-label">Navigation</span>

        <nav className="sidebar-nav">
          {sidebarLinks.map(link => (
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
          <div className="topbar-title">Doctor Dashboard</div>
          <div className="topbar-actions">
            <button className="topbar-icon-btn" title="Alerts">
              <Bell size={18} />
              {alerts.length > 0 && <span className="notif-dot" />}
            </button>
            <div className="topbar-avatar doctor-avatar">DR</div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
