import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Mail, Lock, Eye, EyeOff, Loader2, User,
  Stethoscope, Building2, Heart, Phone, MapPin,
  Calendar, Shield, Hash, ChevronRight
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import './AuthModal.css'

const ROLES = [
  { id: 'patient', label: 'Patient', icon: Heart, color: '#10b981', desc: 'Get AI health insights' },
  { id: 'doctor', label: 'Doctor', icon: Stethoscope, color: '#4f46e5', desc: 'Manage your patients' },
  { id: 'hospital', label: 'Hospital', icon: Building2, color: '#2563eb', desc: 'Hospital control center' },
]

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const [tab, setTab] = useState(initialTab)
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Login State
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Signup State — shared
  const [role, setRole] = useState('patient')
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirm, setSignupConfirm] = useState('')

  // Patient-specific
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [conditions, setConditions] = useState([])

  // Doctor-specific
  const [specialization, setSpecialization] = useState('')
  const [experience, setExperience] = useState('')
  const [licenseId, setLicenseId] = useState('')

  // Hospital-specific
  const [location, setLocation] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [departments, setDepartments] = useState([])
  const [deptInput, setDeptInput] = useState('')

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen, initialTab])

  if (!isOpen) return null

  const toggleCondition = (c) => {
    setConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  const addDept = () => {
    if (deptInput.trim() && !departments.includes(deptInput.trim())) {
      setDepartments(prev => [...prev, deptInput.trim()])
      setDeptInput('')
    }
  }

  const removeDept = (d) => setDepartments(prev => prev.filter(x => x !== d))

  // ── LOGIN ──
  const handleLogin = async (e) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword) { toast.error('Please enter email and password.'); return }
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
      if (error) throw error

      // Fetch role and redirect
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
      const userRole = profile?.role || 'patient'

      toast.success('Welcome back!')
      onClose()

      if (userRole === 'admin') navigate('/admin')
      else if (userRole === 'doctor') navigate('/app/doctor')
      else if (userRole === 'hospital') navigate('/app/hospital')
      else navigate('/app/dashboard')
    } catch (err) {
      toast.error(err.message || 'Login failed.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── SIGNUP ──
  const handleSignup = async (e) => {
    e.preventDefault()
    if (!signupName || !signupEmail || !signupPassword) { toast.error('Please fill all required fields.'); return }
    if (signupPassword.length < 6) { toast.error('Password must be at least 6 characters.'); return }
    if (signupPassword !== signupConfirm) { toast.error('Passwords do not match.'); return }

    setIsLoading(true)
    try {
      // Sign up with role in metadata (trigger will auto-create profile + user_role)
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: { full_name: signupName, role }
        }
      })
      if (error) throw error

      const userId = data.user?.id
      if (!userId) { toast.success('Check your email to confirm your account!'); onClose(); return }

      // Update profile with extra fields
      if (role === 'patient') {
        await supabase.from('profiles').update({
          age: age ? parseInt(age) : null,
          gender: gender || null,
          conditions: conditions.length > 0 ? conditions : [],
        }).eq('id', userId)
      }

      if (role === 'doctor') {
        await supabase.from('doctors').insert([{
          user_id: userId,
          name: signupName,
          specialization: specialization || null,
        }])
      }

      if (role === 'hospital') {
        await supabase.from('hospitals').insert([{
          name: signupName,
          city: location || null,
          contact_number: contactNumber || null,
          departments: departments.length > 0 ? departments : [],
        }])
      }

      toast.success('Account created successfully!')
      onClose()

      if (role === 'doctor') navigate('/app/doctor')
      else if (role === 'hospital') navigate('/app/hospital')
      else navigate('/app/dashboard')
    } catch (err) {
      toast.error(err.message || 'Signup failed.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({ provider: 'google' })
    } catch { toast.error('Google login failed.') }
  }

  return (
    <AnimatePresence>
      <div className="auth-backdrop">
        <motion.div
          className="auth-backdrop-overlay"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          className="auth-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <button className="auth-close-btn" onClick={onClose}><X size={20} /></button>

          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Log In</button>
            <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => setTab('signup')}>Sign Up</button>
            <div className="auth-tab-indicator" style={{ transform: `translateX(${tab === 'login' ? '0%' : '100%'})` }} />
          </div>

          <div className="auth-content-scroller">
            <div className="auth-content-inner" style={{ transform: `translateX(${tab === 'login' ? '0%' : '-50%'})` }}>

              {/* ────── LOGIN PANEL ────── */}
              <div className="auth-panel">
                <div className="auth-modal-header">
                  <h2>Welcome Back</h2>
                  <p>Sign in to your HealthPulse account</p>
                </div>
                <form onSubmit={handleLogin} className="modal-form">
                  <div className="modal-input-group">
                    <label>Email Address</label>
                    <div className="modal-input-wrapper">
                      <Mail className="modal-input-icon" size={18} />
                      <input type="email" placeholder="you@example.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} disabled={isLoading} />
                    </div>
                  </div>
                  <div className="modal-input-group">
                    <div className="modal-password-header">
                      <label>Password</label>
                      <a href="#" className="modal-forgot-link" onClick={e => e.preventDefault()}>Forgot Password?</a>
                    </div>
                    <div className="modal-input-wrapper">
                      <Lock className="modal-input-icon" size={18} />
                      <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} disabled={isLoading} />
                      <button type="button" className="modal-password-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex="-1">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="modal-submit-btn" disabled={isLoading}>
                    {isLoading ? <Loader2 className="modal-spinner" size={18} /> : 'Login'}
                  </button>
                </form>
                <div className="modal-divider"><span>Or continue with</span></div>
                <button className="modal-google-btn" onClick={handleGoogleLogin} disabled={isLoading}>
                  <svg viewBox="0 0 24 24" width="18" height="18"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Google
                </button>
              </div>

              {/* ────── SIGNUP PANEL ────── */}
              <div className="auth-panel">
                <div className="auth-modal-header">
                  <h2>Create Account</h2>
                  <p>Choose your role to get started</p>
                </div>

                {/* Role Selector */}
                <div className="role-selector">
                  {ROLES.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      className={`role-card ${role === r.id ? 'active' : ''}`}
                      onClick={() => setRole(r.id)}
                      style={{ '--role-color': r.color }}
                    >
                      <div className="role-card-icon" style={{ background: `${r.color}15`, color: r.color }}>
                        <r.icon size={20} />
                      </div>
                      <div className="role-card-text">
                        <span className="role-card-label">{r.label}</span>
                        <span className="role-card-desc">{r.desc}</span>
                      </div>
                      {role === r.id && <div className="role-check">✓</div>}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSignup} className="modal-form">
                  {/* Shared fields */}
                  <div className="modal-input-group">
                    <label>{role === 'hospital' ? 'Hospital Name' : 'Full Name'}</label>
                    <div className="modal-input-wrapper">
                      <User className="modal-input-icon" size={18} />
                      <input type="text" placeholder={role === 'hospital' ? 'Apollo Medical Center' : 'Dr. John Doe'} value={signupName} onChange={e => setSignupName(e.target.value)} disabled={isLoading} />
                    </div>
                  </div>
                  <div className="modal-input-group">
                    <label>Email Address</label>
                    <div className="modal-input-wrapper">
                      <Mail className="modal-input-icon" size={18} />
                      <input type="email" placeholder="you@example.com" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} disabled={isLoading} />
                    </div>
                  </div>

                  <div className="modal-form-row">
                    <div className="modal-input-group">
                      <label>Password</label>
                      <div className="modal-input-wrapper">
                        <Lock className="modal-input-icon" size={18} />
                        <input type={showPassword ? "text" : "password"} placeholder="••••••" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} disabled={isLoading} />
                      </div>
                    </div>
                    <div className="modal-input-group">
                      <label>Confirm</label>
                      <div className="modal-input-wrapper">
                        <Lock className="modal-input-icon" size={18} />
                        <input type="password" placeholder="••••••" value={signupConfirm} onChange={e => setSignupConfirm(e.target.value)} disabled={isLoading} />
                      </div>
                    </div>
                  </div>

                  {/* ── PATIENT FIELDS ── */}
                  {role === 'patient' && (
                    <>
                      <div className="modal-form-row">
                        <div className="modal-input-group">
                          <label>Age</label>
                          <div className="modal-input-wrapper">
                            <Calendar className="modal-input-icon" size={18} />
                            <input type="number" placeholder="25" value={age} onChange={e => setAge(e.target.value)} />
                          </div>
                        </div>
                        <div className="modal-input-group">
                          <label>Gender</label>
                          <select className="modal-select" value={gender} onChange={e => setGender(e.target.value)}>
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="modal-input-group">
                        <label>Existing Conditions</label>
                        <div className="condition-chips">
                          {['Diabetes', 'BP', 'Asthma', 'Heart Issues', 'Thyroid'].map(c => (
                            <button type="button" key={c} className={`condition-chip ${conditions.includes(c) ? 'active' : ''}`} onClick={() => toggleCondition(c)}>
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── DOCTOR FIELDS ── */}
                  {role === 'doctor' && (
                    <>
                      <div className="modal-input-group">
                        <label>Specialization</label>
                        <div className="modal-input-wrapper">
                          <Stethoscope className="modal-input-icon" size={18} />
                          <input type="text" placeholder="Cardiologist" value={specialization} onChange={e => setSpecialization(e.target.value)} />
                        </div>
                      </div>
                      <div className="modal-form-row">
                        <div className="modal-input-group">
                          <label>Experience (yrs)</label>
                          <div className="modal-input-wrapper">
                            <Calendar className="modal-input-icon" size={18} />
                            <input type="number" placeholder="5" value={experience} onChange={e => setExperience(e.target.value)} />
                          </div>
                        </div>
                        <div className="modal-input-group">
                          <label>License ID</label>
                          <div className="modal-input-wrapper">
                            <Shield className="modal-input-icon" size={18} />
                            <input type="text" placeholder="MCI-12345" value={licenseId} onChange={e => setLicenseId(e.target.value)} />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── HOSPITAL FIELDS ── */}
                  {role === 'hospital' && (
                    <>
                      <div className="modal-form-row">
                        <div className="modal-input-group">
                          <label>City / Location</label>
                          <div className="modal-input-wrapper">
                            <MapPin className="modal-input-icon" size={18} />
                            <input type="text" placeholder="Mumbai" value={location} onChange={e => setLocation(e.target.value)} />
                          </div>
                        </div>
                        <div className="modal-input-group">
                          <label>Contact Number</label>
                          <div className="modal-input-wrapper">
                            <Phone className="modal-input-icon" size={18} />
                            <input type="tel" placeholder="+91 98765..." value={contactNumber} onChange={e => setContactNumber(e.target.value)} />
                          </div>
                        </div>
                      </div>
                      <div className="modal-input-group">
                        <label>Departments</label>
                        <div className="dept-input-row">
                          <input className="modal-dept-input" type="text" placeholder="Add department..." value={deptInput} onChange={e => setDeptInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDept() } }} />
                          <button type="button" className="dept-add-btn" onClick={addDept}>+</button>
                        </div>
                        {departments.length > 0 && (
                          <div className="condition-chips" style={{ marginTop: '0.5rem' }}>
                            {departments.map(d => (
                              <span key={d} className="condition-chip active" onClick={() => removeDept(d)} style={{ cursor: 'pointer' }}>
                                {d} ✕
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <button type="submit" className="modal-submit-btn" disabled={isLoading} style={{ marginTop: '0.5rem' }}>
                    {isLoading ? <Loader2 className="modal-spinner" size={18} /> : (
                      <>Create {role.charAt(0).toUpperCase() + role.slice(1)} Account <ChevronRight size={16} /></>
                    )}
                  </button>
                </form>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
