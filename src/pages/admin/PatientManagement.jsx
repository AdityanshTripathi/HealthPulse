import { useState, useEffect } from 'react'
import { Search, X, Phone, Video, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'react-hot-toast'

export default function PatientManagement() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchCases() }, [])

  const fetchCases = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('cases')
      .select('*, doctors(name), hospitals(name)')
      .order('risk_score', { ascending: false })
    if (!error) setCases(data || [])
    setLoading(false)
  }

  const markResolved = async (id) => {
    await supabase.from('cases').update({ status: 'resolved' }).eq('id', id)
    toast.success('Case marked as resolved.')
    setSelected(null)
    fetchCases()
  }

  const filtered = cases.filter(c => {
    if (filter !== 'all' && c.severity !== filter) return false
    if (search && !c.patient_name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const getRiskColor = (score) => {
    if (score >= 70) return '#dc2626'
    if (score >= 40) return '#ea580c'
    return '#16a34a'
  }

  const parseSymptoms = (s) => {
    if (Array.isArray(s)) return s
    try { return JSON.parse(s) } catch { return [] }
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Patient Management</h1>
        <p>Monitor triage cases, assign doctors, and manage resolutions</p>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3>All Cases ({filtered.length})</h3>
          <div className="table-filters">
            {['all', 'Emergency', 'Urgent', 'Routine'].map(f => (
              <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f}
              </button>
            ))}
            <input
              type="text" className="table-search" placeholder="Search patient..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Age</th>
              <th>Symptoms</th>
              <th>Risk</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} style={c.severity === 'Emergency' ? { borderLeft: '3px solid #dc2626' } : {}}>
                <td style={{ fontWeight: 600 }}>{c.patient_name}</td>
                <td>{c.patient_age}</td>
                <td>
                  <div className="symptom-chips">
                    {parseSymptoms(c.symptoms).slice(0, 2).map((s, i) => (
                      <span key={i} className="symptom-chip">{s}</span>
                    ))}
                    {parseSymptoms(c.symptoms).length > 2 && (
                      <span className="symptom-chip">+{parseSymptoms(c.symptoms).length - 2}</span>
                    )}
                  </div>
                </td>
                <td>
                  <span style={{ fontWeight: 700, color: getRiskColor(c.risk_score) }}>{c.risk_score}</span>
                </td>
                <td>
                  <span className={`severity-badge ${c.severity.toLowerCase()}`}>
                    {c.severity === 'Emergency' && '🚨 '}{c.severity}
                  </span>
                </td>
                <td><span className={`status-pill ${c.status}`}>{c.status}</span></td>
                <td>
                  <button className="action-btn action-btn-primary" onClick={() => setSelected(c)}>View</button>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan="7" className="empty-state"><p>No matching cases</p></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="detail-modal-overlay" onClick={() => setSelected(null)}>
          <div className="detail-modal" onClick={e => e.stopPropagation()}>
            <div className="detail-modal-header">
              <h2>{selected.patient_name}</h2>
              <button className="action-btn" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <div className="detail-modal-body">
              <div className="detail-row">
                <div className="detail-field">
                  <label>Age</label>
                  <span>{selected.patient_age} years</span>
                </div>
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
                    <div
                      className="risk-bar-fill"
                      style={{
                        width: `${selected.risk_score}%`,
                        background: getRiskColor(selected.risk_score),
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="detail-field">
                <label>Symptoms</label>
                <div className="symptom-chips">
                  {parseSymptoms(selected.symptoms).map((s, i) => (
                    <span key={i} className="symptom-chip">{s}</span>
                  ))}
                </div>
              </div>

              <div className="detail-field">
                <label>AI Analysis</label>
                <p style={{ lineHeight: 1.6, color: '#334155' }}>{selected.ai_analysis || 'No analysis available.'}</p>
              </div>

              <div className="detail-row">
                <div className="detail-field">
                  <label>Assigned Doctor</label>
                  <span>{selected.doctors?.name || 'Unassigned'}</span>
                </div>
                <div className="detail-field">
                  <label>Hospital</label>
                  <span>{selected.hospitals?.name || 'None'}</span>
                </div>
              </div>
            </div>

            <div className="detail-actions">
              <button style={{ background: '#eef2ff', color: '#4f46e5' }} onClick={() => toast('Calling patient...')}>
                <Phone size={16} /> Call
              </button>
              <button style={{ background: '#ede9fe', color: '#7c3aed' }} onClick={() => toast('Starting video...')}>
                <Video size={16} /> Video
              </button>
              <button
                style={{ background: '#d1fae5', color: '#166534' }}
                onClick={() => markResolved(selected.id)}
              >
                <CheckCircle2 size={16} /> Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
