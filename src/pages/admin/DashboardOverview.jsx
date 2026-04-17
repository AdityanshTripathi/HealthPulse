import { useState, useEffect } from 'react'
import {
  Users, AlertTriangle, Stethoscope, Building2, Activity,
  TrendingUp, Clock, ArrowUpRight
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

export default function DashboardOverview() {
  const [metrics, setMetrics] = useState({
    totalCases: 0,
    emergencies: 0,
    activeConsults: 0,
    hospitals: 0,
    doctors: 0,
    onlineDoctors: 0,
  })
  const [recentCases, setRecentCases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const [casesRes, hospRes, docRes, recentRes] = await Promise.all([
        supabase.from('cases').select('severity, status'),
        supabase.from('hospitals').select('id').eq('status', 'active'),
        supabase.from('doctors').select('availability_status'),
        supabase.from('cases').select('*').order('created_at', { ascending: false }).limit(5),
      ])

      const cases = casesRes.data || []
      setMetrics({
        totalCases: cases.length,
        emergencies: cases.filter(c => c.severity === 'Emergency').length,
        activeConsults: cases.filter(c => c.status === 'active').length,
        hospitals: (hospRes.data || []).length,
        doctors: (docRes.data || []).length,
        onlineDoctors: (docRes.data || []).filter(d => d.availability_status === 'online').length,
      })
      setRecentCases(recentRes.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const metricCards = [
    { label: 'Total Patients', value: metrics.totalCases, icon: Users, color: '#4f46e5', bg: '#eef2ff' },
    { label: 'Emergency Cases', value: metrics.emergencies, icon: AlertTriangle, color: '#dc2626', bg: '#fef2f2' },
    { label: 'Active Consults', value: metrics.activeConsults, icon: Activity, color: '#2563eb', bg: '#dbeafe' },
    { label: 'Hospitals', value: metrics.hospitals, icon: Building2, color: '#059669', bg: '#d1fae5' },
    { label: 'Total Doctors', value: metrics.doctors, icon: Stethoscope, color: '#7c3aed', bg: '#ede9fe' },
    { label: 'Doctors Online', value: metrics.onlineDoctors, icon: TrendingUp, color: '#10b981', bg: '#d1fae5' },
  ]

  const getRiskColor = (score) => {
    if (score >= 70) return '#dc2626'
    if (score >= 40) return '#ea580c'
    return '#16a34a'
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Dashboard Overview</h1>
        <p>Real-time view of your healthcare system</p>
      </div>

      <div className="metrics-grid">
        {metricCards.map((m, i) => (
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

      {/* Recent Cases */}
      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3>Recent Triage Cases</h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            <Clock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Last updated just now
          </span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Age</th>
              <th>Risk</th>
              <th>Severity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentCases.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.patient_name}</td>
                <td>{c.patient_age}</td>
                <td>
                  <span style={{ fontWeight: 700, color: getRiskColor(c.risk_score) }}>{c.risk_score}/100</span>
                </td>
                <td>
                  <span className={`severity-badge ${c.severity.toLowerCase()}`}>
                    {c.severity === 'Emergency' && '🚨 '}
                    {c.severity}
                  </span>
                </td>
                <td><span className={`status-pill ${c.status}`}>{c.status}</span></td>
              </tr>
            ))}
            {!loading && recentCases.length === 0 && (
              <tr><td colSpan="5" className="empty-state"><p>No cases found</p></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
