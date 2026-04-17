import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Stethoscope, Calendar, Settings,
  Menu, X, Building2, LogOut, Bell, ChevronRight, AlertTriangle
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'react-hot-toast'
import '../admin/AdminLayout.css'
import '../doctor/DoctorLayout.css'
import './HospitalLayout.css'

const sidebarLinks = [
  { to: '/hospital', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/hospital/patients', icon: Users, label: 'Patients' },
  { to: '/hospital/doctors', icon: Stethoscope, label: 'Doctors' },
  { to: '/hospital/appointments', icon: Calendar, label: 'Appointments' },
]

const DEMO_HOSPITAL_ID = 'a1b2c3d4-0001-4000-a000-000000000001'

export default function HospitalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [alertCount, setAlertCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    // Real-time emergency alerts
    const channel = supabase
      .channel('hospital-emergency-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'cases', filter: 'severity=eq.Emergency' },
        (payload) => {
          const c = payload.new
          toast.error(`🚨 NEW EMERGENCY: ${c.patient_name} — Risk ${c.risk_score}/100`, { duration: 10000 })
          setAlertCount(prev => prev + 1)
          window.dispatchEvent(new Event('hospital-case-update'))
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cases' },
        () => { window.dispatchEvent(new Event('hospital-case-update')) }
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
    <div className="admin-shell hospital-shell">
      <aside className={`admin-sidebar hospital-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo-icon hospital-logo-icon">
              <Building2 size={18} color="#fff" />
            </div>
            <span>Health<span className="gradient-text">Pulse</span></span>
          </div>
          <button className="sidebar-close-mobile" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="hospital-role-badge">
          <Building2 size={12} />
          Hospital Portal
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

      <div className="admin-main">
        <header className="admin-topbar">
          <button className="topbar-hamburger" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="topbar-title">Hospital Control Center</div>
          <div className="topbar-actions">
            <button className="topbar-icon-btn" title="Emergency Alerts" onClick={() => setAlertCount(0)}>
              <AlertTriangle size={18} />
              {alertCount > 0 && <span className="notif-dot" />}
            </button>
            <button className="topbar-icon-btn" title="Notifications">
              <Bell size={18} />
            </button>
            <div className="topbar-avatar hospital-avatar">HC</div>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
