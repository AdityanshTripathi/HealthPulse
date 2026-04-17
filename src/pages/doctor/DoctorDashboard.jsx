import { useState, useEffect } from 'react'
import {
  AlertTriangle, Users, Clock, Brain, Calendar,
  Phone, Video, CheckCircle2, X, Zap, Heart, FileText
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'react-hot-toast'

// Use first seeded doctor as the "logged-in" doctor for demo
const DEMO_DOCTOR_ID = 'b1b2c3d4-0001-4000-a000-000000000001'

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null)
  const [cases, setCases] = useState([])
  const [appointments, setAppointments] = useState([])
  const [selected, setSelected] = useState(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
    // Listen for real-time case updates
    const handler = () => fetchAll()
    window.addEventListener('case-updated', handler)
    return () => window.removeEventListener('case-updated', handler)
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    const [docRes, casesRes, apptRes] = await Promise.all([
      supabase.from('doctors').select('*, hospitals(name)').eq('id', DEMO_DOCTOR_ID).single(),
      supabase.from('cases').select('*, hospitals(name)').order('risk_score', { ascending: false }),
      supabase.from('appointments').select('*, hospitals(name)').eq('doctor_id', DEMO_DOCTOR_ID).order('slot_time'),
    ])
    setDoctor(docRes.data)
    setCases(casesRes.data || [])
    setAppointments(apptRes.data || [])
    setLoading(false)
  }

  const toggleStatus = async () => {
    if (!doctor) return
    const next = doctor.availability_status === 'online' ? 'offline' : 'online'
    await supabase.from('doctors').update({ availability_status: next }).eq('id', DEMO_DOCTOR_ID)
    setDoctor(prev => ({ ...prev, availability_status: next }))
    toast.success(`You are now ${next}.`)
  }

  const markResolved = async (id) => {
    await supabase.from('cases').update({ status: 'resolved' }).eq('id', id)
    toast.success('Case marked as treated.')
    setSelected(null)
    fetchAll()
  }

  const parseSymptoms = (s) => {
    if (Array.isArray(s)) return s
    try { return JSON.parse(s) } catch { return [] }
  }

  const getRiskColor = (score) => {
    if (score >= 70) return '#dc2626'
    if (score >= 40) return '#ea580c'
    return '#16a34a'
  }

  const getRiskLevel = (score) => {
    if (score >= 70) return 'high'
    if (score >= 40) return 'medium'
    return 'low'
  }

  const formatTime = (iso) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  const emergency = cases.filter(c => c.severity === 'Emergency' && c.status !== 'resolved')
  const urgent = cases.filter(c => c.severity === 'Urgent' && c.status !== 'resolved')
  const routine = cases.filter(c => c.severity === 'Routine' && c.status !== 'resolved')

  // Generate AI insights from cases
  const insights = []
  emergency.forEach(c => {
    insights.push({ icon: AlertTriangle, color: '#dc2626', bg: '#fef2f2', text: `<strong>${c.patient_name}</strong> — ${c.ai_analysis?.split('.')[0] || 'High risk detected'}` })
  })
  urgent.forEach(c => {
    if (insights.length < 4) {
      insights.push({ icon: Heart, color: '#ea580c', bg: '#fff7ed', text: `<strong>${c.patient_name}</strong> — ${c.ai_analysis?.split('.')[0] || 'Needs attention'}` })
    }
  })

  return (
    <div>
      {/* Doctor Header */}
      {doctor && (
        <div className="doctor-header-card">
          <div className="doc-identity">
            <div className="doc-avatar-lg">{doctor.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
            <div>
              <div className="doc-name">{doctor.name}</div>
              <div className="doc-spec">{doctor.specialization} · {doctor.hospitals?.name || 'Unaffiliated'}</div>
            </div>
          </div>
          <div className="doc-status-toggle">
            <span className={`status-label ${doctor.availability_status}`}>
              {doctor.availability_status === 'online' ? '● Online' : '○ Offline'}
            </span>
            <button className={`status-switch ${doctor.availability_status}`} onClick={toggleStatus}>
              <div className="status-switch-knob" />
            </button>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="metrics-grid" style={{ marginTop: '1.5rem' }}>
        {[
          { label: 'Emergency', value: emergency.length, icon: AlertTriangle, color: '#dc2626', bg: '#fef2f2' },
          { label: 'Urgent', value: urgent.length, icon: Clock, color: '#ea580c', bg: '#fff7ed' },
          { label: 'Routine', value: routine.length, icon: Users, color: '#16a34a', bg: '#f0fdf4' },
          { label: "Today's Appts", value: appointments.filter(a => new Date(a.slot_time).toDateString() === new Date().toDateString()).length, icon: Calendar, color: '#4f46e5', bg: '#eef2ff' },
        ].map((m, i) => (
          <div key={i} className="metric-card">
            <div className="metric-icon-wrap" style={{ background: m.bg }}>
              <m.icon size={22} style={{ color: m.color }} />
            </div>
            <div className="metric-info">
              <span className="metric-value">{loading ? '–' : m.value}</span>
              <span className="metric-label">{m.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="doc-dashboard-grid">
        {/* Left column: Priority Cases */}
        <div className="doc-main-col">
          <div className="admin-page-header" style={{ marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: '1.35rem' }}>Priority Cases</h1>
            <p>Cases sorted by severity — emergencies first</p>
          </div>

          {emergency.length > 0 && (
            <div className="severity-section">
              <div className="severity-section-title emergency">
                <AlertTriangle size={16} /> Emergency ({emergency.length})
              </div>
              <div className="case-cards">
                {emergency.map(c => (
                  <div key={c.id} className="case-card emergency-card" onClick={() => { setSelected(c); setNotes('') }}>
                    <div className="case-card-info">
                      <div className="case-card-name">{c.patient_name}</div>
                      <div className="case-card-meta">Age {c.patient_age} · {c.status}</div>
                      <div className="case-card-symptoms">
                        {parseSymptoms(c.symptoms).slice(0, 3).map((s, i) => <span key={i} className="symptom-chip">{s}</span>)}
                      </div>
                    </div>
                    <div className="case-card-risk">
                      <div className={`risk-circle ${getRiskLevel(c.risk_score)}`}>{c.risk_score}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {urgent.length > 0 && (
            <div className="severity-section">
              <div className="severity-section-title urgent">
                <Clock size={16} /> Urgent ({urgent.length})
              </div>
              <div className="case-cards">
                {urgent.map(c => (
                  <div key={c.id} className="case-card urgent-card" onClick={() => { setSelected(c); setNotes('') }}>
                    <div className="case-card-info">
                      <div className="case-card-name">{c.patient_name}</div>
                      <div className="case-card-meta">Age {c.patient_age} · {c.status}</div>
                      <div className="case-card-symptoms">
                        {parseSymptoms(c.symptoms).slice(0, 3).map((s, i) => <span key={i} className="symptom-chip">{s}</span>)}
                      </div>
                    </div>
                    <div className="case-card-risk">
                      <div className={`risk-circle ${getRiskLevel(c.risk_score)}`}>{c.risk_score}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {routine.length > 0 && (
            <div className="severity-section">
              <div className="severity-section-title routine">
                <CheckCircle2 size={16} /> Routine ({routine.length})
              </div>
              <div className="case-cards">
                {routine.map(c => (
                  <div key={c.id} className="case-card routine-card" onClick={() => { setSelected(c); setNotes('') }}>
                    <div className="case-card-info">
                      <div className="case-card-name">{c.patient_name}</div>
                      <div className="case-card-meta">Age {c.patient_age} · {c.status}</div>
                      <div className="case-card-symptoms">
                        {parseSymptoms(c.symptoms).slice(0, 3).map((s, i) => <span key={i} className="symptom-chip">{s}</span>)}
                      </div>
                    </div>
                    <div className="case-card-risk">
                      <div className={`risk-circle ${getRiskLevel(c.risk_score)}`}>{c.risk_score}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && emergency.length === 0 && urgent.length === 0 && routine.length === 0 && (
            <div className="empty-state"><p>No active cases at the moment.</p></div>
          )}
        </div>

        {/* Right column: AI Insights + Appointments */}
        <div className="doc-side-col">
          {/* AI Insights */}
          <div className="insights-card">
            <div className="insights-card-header">
              <Brain size={18} style={{ color: '#7c3aed' }} />
              AI Insights
            </div>
            <div className="insights-list">
              {insights.length > 0 ? insights.map((ins, i) => (
                <div key={i} className="insight-item">
                  <div className="insight-icon-wrap" style={{ background: ins.bg }}>
                    <ins.icon size={16} style={{ color: ins.color }} />
                  </div>
                  <div className="insight-text" dangerouslySetInnerHTML={{ __html: ins.text }} />
                </div>
              )) : (
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '0.5rem' }}>No critical insights at this time.</div>
              )}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="insights-card">
            <div className="insights-card-header">
              <Calendar size={18} style={{ color: '#4f46e5' }} />
              Upcoming Appointments
            </div>
            <div className="appt-mini-list">
              {appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled').slice(0, 5).map(a => (
                <div key={a.id} className="appt-mini-item">
                  <div className="appt-mini-time">{formatTime(a.slot_time)}</div>
                  <div className="appt-mini-info">
                    <div className="appt-mini-name">{a.patient_name}</div>
                    <div className="appt-mini-note">{a.hospitals?.name || 'Online'} · <span className={`status-pill ${a.status}`}>{a.status}</span></div>
                  </div>
                </div>
              ))}
              {appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled').length === 0 && (
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '0.5rem' }}>No upcoming appointments.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Detail Modal */}
      {selected && (
        <div className="detail-modal-overlay" onClick={() => setSelected(null)}>
          <div className="detail-modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="detail-modal-header">
              <h2>{selected.patient_name}</h2>
              <button className="action-btn" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <div className="detail-modal-body">
              <div className="detail-row">
                <div className="detail-field"><label>Age</label><span>{selected.patient_age} years</span></div>
                <div className="detail-field">
                  <label>Severity</label>
                  <span className={`severity-badge ${selected.severity.toLowerCase()}`}>
                    {selected.severity === 'Emergency' && '🚨 '}{selected.severity}
                  </span>
                </div>
              </div>

              <div className="detail-field">
                <label>Risk Score</label>
                <div className="risk-bar-wrap">
                  <span style={{ fontWeight: 700, fontSize: '1.25rem', color: getRiskColor(selected.risk_score) }}>
                    {selected.risk_score}/100
                  </span>
                  <div className="risk-bar">
                    <div className="risk-bar-fill" style={{ width: `${selected.risk_score}%`, background: getRiskColor(selected.risk_score) }} />
                  </div>
                </div>
              </div>

              <div className="detail-field">
                <label>Symptoms</label>
                <div className="symptom-chips">
                  {parseSymptoms(selected.symptoms).map((s, i) => <span key={i} className="symptom-chip">{s}</span>)}
                </div>
              </div>

              <div className="detail-field">
                <label><Brain size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />AI Analysis</label>
                <p style={{ lineHeight: 1.6, color: '#334155', background: '#f8fafc', padding: '0.75rem', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                  {selected.ai_analysis || 'No analysis available.'}
                </p>
              </div>

              <div className="detail-field">
                <label>Hospital</label>
                <span>{selected.hospitals?.name || 'Not assigned'}</span>
              </div>

              <div className="detail-field">
                <label><FileText size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Doctor Notes</label>
                <textarea
                  className="notes-textarea"
                  placeholder="Add clinical notes for this patient..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="detail-actions">
              <button style={{ background: '#eef2ff', color: '#4f46e5' }} onClick={() => toast('Calling patient...')}>
                <Phone size={16} /> Call
              </button>
              <button style={{ background: '#ede9fe', color: '#7c3aed' }} onClick={() => toast('Starting video consult...')}>
                <Video size={16} /> Video
              </button>
              <button style={{ background: '#d1fae5', color: '#166534' }} onClick={() => markResolved(selected.id)}>
                <CheckCircle2 size={16} /> Treated
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
