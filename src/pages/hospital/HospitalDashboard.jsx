import { useState, useEffect } from 'react'
import {
  AlertTriangle, Users, Stethoscope, Calendar, Clock,
  Ambulance, CheckCircle2, X, Phone, Video, Brain,
  Activity, BarChart3
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'react-hot-toast'

const DEMO_HOSPITAL_ID = 'a1b2c3d4-0001-4000-a000-000000000001'

export default function HospitalDashboard() {
  const [hospital, setHospital] = useState(null)
  const [cases, setCases] = useState([])
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchAll()
    const handler = () => fetchAll()
    window.addEventListener('hospital-case-update', handler)
    return () => window.removeEventListener('hospital-case-update', handler)
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    const [hospRes, casesRes, docRes, apptRes] = await Promise.all([
      supabase.from('hospitals').select('*').eq('id', DEMO_HOSPITAL_ID).single(),
      supabase.from('cases').select('*, doctors(name)').order('risk_score', { ascending: false }),
      supabase.from('doctors').select('*').eq('hospital_id', DEMO_HOSPITAL_ID),
      supabase.from('appointments').select('*').eq('hospital_id', DEMO_HOSPITAL_ID).order('slot_time'),
    ])
    setHospital(hospRes.data)
    setCases(casesRes.data || [])
    setDoctors(docRes.data || [])
    setAppointments(apptRes.data || [])
    setLoading(false)
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

  const assignDoctor = async (caseId, doctorId) => {
    if (!doctorId) return
    await supabase.from('cases').update({
      assigned_doctor_id: doctorId,
      assigned_hospital_id: DEMO_HOSPITAL_ID,
      status: 'active'
    }).eq('id', caseId)
    toast.success('Doctor assigned successfully.')
    fetchAll()
  }

  const markHandled = async (caseId) => {
    await supabase.from('cases').update({ status: 'resolved' }).eq('id', caseId)
    toast.success('Emergency case handled.')
    fetchAll()
  }

  const formatTime = (iso) => {
    const d = new Date(iso)
    const now = new Date()
    const diff = Math.floor((now - d) / 60000)
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  const activeCases = cases.filter(c => c.status !== 'resolved')
  const emergencies = activeCases.filter(c => c.severity === 'Emergency')
  const urgentCases = activeCases.filter(c => c.severity === 'Urgent')
  const routineCases = activeCases.filter(c => c.severity === 'Routine')
  const onlineDoctors = doctors.filter(d => d.availability_status === 'online')
  const todayAppts = appointments.filter(a => new Date(a.slot_time).toDateString() === new Date().toDateString())

  // Analytics
  const totalCapacity = Math.max(doctors.length * 5, 1)
  const patientLoad = Math.round((activeCases.length / totalCapacity) * 100)
  const emergencyLoad = Math.round((emergencies.length / Math.max(activeCases.length, 1)) * 100)
  const doctorUtil = Math.round(((doctors.length - onlineDoctors.length) / Math.max(doctors.length, 1)) * 100)

  return (
    <div>
      {/* Hospital Identity */}
      <div className="doctor-header-card" style={{ marginBottom: '1.5rem' }}>
        <div className="doc-identity">
          <div className="doc-avatar-lg" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
            {hospital?.name?.charAt(0) || 'H'}
          </div>
          <div>
            <div className="doc-name">{hospital?.name || 'Hospital'}</div>
            <div className="doc-spec">{hospital?.city || ''} · {(hospital?.departments || []).length} Departments · {doctors.length} Doctors</div>
          </div>
        </div>
        <span className={`status-pill ${hospital?.status || 'active'}`} style={{ fontSize: '0.85rem', padding: '0.3rem 0.75rem' }}>
          {hospital?.status || 'active'}
        </span>
      </div>

      {/* Metric Cards */}
      <div className="metrics-grid">
        {[
          { label: 'Active Patients', value: activeCases.length, icon: Users, color: '#2563eb', bg: '#dbeafe' },
          { label: 'Emergency Cases', value: emergencies.length, icon: AlertTriangle, color: '#dc2626', bg: '#fef2f2' },
          { label: 'Doctors Available', value: onlineDoctors.length, icon: Stethoscope, color: '#059669', bg: '#d1fae5' },
          { label: "Today's Appointments", value: todayAppts.length, icon: Calendar, color: '#7c3aed', bg: '#ede9fe' },
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

      {/* Emergency Control Panel */}
      {emergencies.length > 0 && (
        <div className="emergency-panel">
          <div className="emergency-panel-header">
            <h3><AlertTriangle size={20} /> Emergency Control Panel</h3>
            <span className="emergency-panel-count">{emergencies.length} Active</span>
          </div>
          <div className="emergency-grid">
            {emergencies.map(c => (
              <div key={c.id} className="emergency-case-card">
                <div className="emergency-case-top">
                  <div>
                    <div className="emergency-case-name">{c.patient_name}</div>
                    <div className="emergency-case-condition">
                      {parseSymptoms(c.symptoms).slice(0, 2).join(', ')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#dc2626' }}>{c.risk_score}</span>
                    <div className="emergency-case-time">
                      <Clock size={11} style={{ verticalAlign: 'middle', marginRight: 2 }} />
                      {formatTime(c.created_at)}
                    </div>
                  </div>
                </div>
                <div className="emergency-case-bottom">
                  <select
                    className="assign-select"
                    value={c.assigned_doctor_id || ''}
                    onChange={e => assignDoctor(c.id, e.target.value)}
                  >
                    <option value="">Assign Doctor</option>
                    {doctors.filter(d => d.availability_status === 'online').map(d => (
                      <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>
                    ))}
                  </select>
                  <div className="emergency-case-actions">
                    <button className="action-btn action-btn-danger" onClick={() => toast('🚑 Ambulance dispatched!')}>
                      <Ambulance size={14} /> Dispatch
                    </button>
                    <button className="action-btn action-btn-success" onClick={() => markHandled(c.id)}>
                      <CheckCircle2 size={14} /> Handled
                    </button>
                  </div>
                </div>
                {c.doctors?.name && (
                  <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>
                    Assigned: {c.doctors.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patient Queue — 3-column triage view */}
      <div className="admin-page-header" style={{ marginBottom: '0.75rem' }}>
        <h1 style={{ fontSize: '1.25rem' }}>Patient Queue</h1>
      </div>
      <div className="queue-grid">
        {/* Emergency Column */}
        <div className="queue-column">
          <div className="queue-column-header emergency">
            <span>🔴 Emergency</span>
            <span className="queue-column-count">{emergencies.length}</span>
          </div>
          <div className="queue-list">
            {emergencies.map(c => (
              <div key={c.id} className="queue-item" onClick={() => setSelected(c)}>
                <div className="queue-item-info">
                  <div className="queue-item-name">{c.patient_name}</div>
                  <div className="queue-item-symptoms">{parseSymptoms(c.symptoms).join(', ')}</div>
                </div>
                <span className="queue-item-risk" style={{ color: '#dc2626' }}>{c.risk_score}</span>
              </div>
            ))}
            {emergencies.length === 0 && <div style={{ color: '#94a3b8', fontSize: '0.8rem', padding: '0.5rem' }}>No emergency cases</div>}
          </div>
        </div>

        {/* Urgent Column */}
        <div className="queue-column">
          <div className="queue-column-header urgent">
            <span>🟠 Urgent</span>
            <span className="queue-column-count">{urgentCases.length}</span>
          </div>
          <div className="queue-list">
            {urgentCases.map(c => (
              <div key={c.id} className="queue-item" onClick={() => setSelected(c)}>
                <div className="queue-item-info">
                  <div className="queue-item-name">{c.patient_name}</div>
                  <div className="queue-item-symptoms">{parseSymptoms(c.symptoms).join(', ')}</div>
                </div>
                <span className="queue-item-risk" style={{ color: '#ea580c' }}>{c.risk_score}</span>
              </div>
            ))}
            {urgentCases.length === 0 && <div style={{ color: '#94a3b8', fontSize: '0.8rem', padding: '0.5rem' }}>No urgent cases</div>}
          </div>
        </div>

        {/* Routine Column */}
        <div className="queue-column">
          <div className="queue-column-header routine">
            <span>🟢 Routine</span>
            <span className="queue-column-count">{routineCases.length}</span>
          </div>
          <div className="queue-list">
            {routineCases.map(c => (
              <div key={c.id} className="queue-item" onClick={() => setSelected(c)}>
                <div className="queue-item-info">
                  <div className="queue-item-name">{c.patient_name}</div>
                  <div className="queue-item-symptoms">{parseSymptoms(c.symptoms).join(', ')}</div>
                </div>
                <span className="queue-item-risk" style={{ color: '#16a34a' }}>{c.risk_score}</span>
              </div>
            ))}
            {routineCases.length === 0 && <div style={{ color: '#94a3b8', fontSize: '0.8rem', padding: '0.5rem' }}>No routine cases</div>}
          </div>
        </div>
      </div>

      {/* Load Analytics */}
      <div className="load-analytics">
        <div className="load-card">
          <h4><Activity size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Current Load</h4>
          {[
            { label: 'Patient', pct: Math.min(patientLoad, 100), color: '#2563eb' },
            { label: 'Emergency', pct: Math.min(emergencyLoad, 100), color: '#dc2626' },
            { label: 'Doctor Util', pct: Math.min(doctorUtil, 100), color: '#059669' },
          ].map((b, i) => (
            <div key={i} className="load-bar-item">
              <span className="load-bar-label">{b.label}</span>
              <div className="load-bar-track">
                <div className="load-bar-fill" style={{ width: `${b.pct}%`, background: b.color }} />
              </div>
              <span className="load-bar-value" style={{ color: b.color }}>{b.pct}%</span>
            </div>
          ))}
        </div>

        <div className="load-card">
          <h4><BarChart3 size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Doctor Availability</h4>
          {doctors.map((d, i) => (
            <div key={i} className="load-bar-item">
              <span className="load-bar-label" style={{ minWidth: 120 }}>{d.name.split(' ').slice(1).join(' ')}</span>
              <span className={`status-pill ${d.availability_status}`}>{d.availability_status}</span>
            </div>
          ))}
          {doctors.length === 0 && <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No doctors registered.</div>}
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
                  <span style={{ fontWeight: 700, fontSize: '1.25rem', color: getRiskColor(selected.risk_score) }}>{selected.risk_score}/100</span>
                  <div className="risk-bar"><div className="risk-bar-fill" style={{ width: `${selected.risk_score}%`, background: getRiskColor(selected.risk_score) }} /></div>
                </div>
              </div>
              <div className="detail-field">
                <label>Symptoms</label>
                <div className="symptom-chips">{parseSymptoms(selected.symptoms).map((s, i) => <span key={i} className="symptom-chip">{s}</span>)}</div>
              </div>
              <div className="detail-field">
                <label><Brain size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />AI Analysis</label>
                <p style={{ lineHeight: 1.6, color: '#334155', background: '#f8fafc', padding: '0.75rem', borderRadius: 10 }}>{selected.ai_analysis || 'No analysis.'}</p>
              </div>
              <div className="detail-field">
                <label>Assign Doctor</label>
                <select className="table-search" style={{ width: '100%' }} value={selected.assigned_doctor_id || ''} onChange={e => { assignDoctor(selected.id, e.target.value); setSelected(null) }}>
                  <option value="">— Select Doctor —</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>)}
                </select>
              </div>
            </div>
            <div className="detail-actions">
              <button style={{ background: '#eef2ff', color: '#4f46e5' }} onClick={() => toast('Calling...')}><Phone size={16} /> Call</button>
              <button style={{ background: '#ede9fe', color: '#7c3aed' }} onClick={() => toast('Video starting...')}><Video size={16} /> Video</button>
              <button style={{ background: '#d1fae5', color: '#166534' }} onClick={() => { markHandled(selected.id); setSelected(null) }}><CheckCircle2 size={16} /> Resolve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
