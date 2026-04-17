import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Activity, Menu, X, Phone, LogOut, User } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { toast } from 'react-hot-toast'
import './Navbar.css'

export default function Navbar({ onAuthClick }) {
  const { session, role, logout: authLogout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location])

  const isEmergencyPage = location.pathname === '/emergency'

  const getDashPath = () => {
    if (role === 'doctor') return '/app/doctor'
    if (role === 'hospital') return '/app/hospital'
    return '/app/dashboard'
  }

  const handleLogout = async () => {
    try {
      await authLogout()
      toast.success('Logged out successfully.')
      navigate('/')
    } catch (error) {
      toast.error('Error logging out.')
    }
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${isEmergencyPage ? 'navbar-emergency' : ''}`} id="main-navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <Activity size={20} color="#fff" />
          </div>
          <span>Health<span className="gradient-text">Pulse</span></span>
        </Link>

        <ul className="navbar-links">
          {session ? (
            <>
              <li><Link to="/triage" className={location.pathname === '/triage' ? 'active' : ''}>Symptom Check</Link></li>
              <li><Link to={getDashPath()} className={location.pathname.startsWith('/app') ? 'active' : ''}>Dashboard</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
              <li><Link to="/triage" className={location.pathname === '/triage' ? 'active' : ''}>Features</Link></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); onAuthClick('login'); }}>Login / Get Started</a></li>
            </>
          )}
        </ul>

        <div className="navbar-actions">
          {session && (
            <button className="btn btn-outline btn-sm logout-btn" onClick={handleLogout} style={{ marginRight: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
              <LogOut size={16} /> Logout
            </button>
          )}

          <Link to="/emergency" className="btn btn-danger btn-sm emergency-btn" id="emergency-nav-btn">
            <Phone size={14} />
            Emergency
          </Link>
          
          <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-menu glass">
          {session ? (
            <>
              <Link to="/triage">Symptom Check</Link>
              <Link to={getDashPath()}>Dashboard</Link>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a>
            </>
          ) : (
            <>
              <Link to="/">Home</Link>
              <Link to="/triage">Features</Link>
              <a href="#" onClick={(e) => { e.preventDefault(); onAuthClick('login'); }}>Login / Get Started</a>
            </>
          )}
          <Link to="/emergency" className="mobile-emergency">Emergency SOS</Link>
        </div>
      )}
    </nav>
  )
}
