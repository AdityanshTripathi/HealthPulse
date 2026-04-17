import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Stethoscope, Building2, Calendar,
  Menu, X, Activity, LogOut, Bell, ChevronRight
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'react-hot-toast'
import './AdminLayout.css'

const sidebarLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/patients', icon: Users, label: 'Patients' },
  { to: '/admin/doctors', icon: Stethoscope, label: 'Doctors' },
  { to: '/admin/hospitals', icon: Building2, label: 'Hospitals' },
  { to: '/admin/appointments', icon: Calendar, label: 'Appointments' },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out.')
    navigate('/')
  }

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo-icon"><Activity size={18} color="#fff" /></div>
            <span>Health<span className="gradient-text">Pulse</span></span>
          </div>
          <button className="sidebar-close-mobile" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <span className="sidebar-section-label">Main Menu</span>

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

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="topbar-hamburger" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="topbar-title">Admin Panel</div>
          <div className="topbar-actions">
            <button className="topbar-icon-btn" title="Notifications">
              <Bell size={18} />
              <span className="notif-dot" />
            </button>
            <div className="topbar-avatar">AD</div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
