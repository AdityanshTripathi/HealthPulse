import { useState, useEffect } from 'react'
import { Stethoscope, Building2, Mail, Phone } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'react-hot-toast'

const DEMO_DOCTOR_ID = 'b1b2c3d4-0001-4000-a000-000000000001'

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState(null)
  const [stats, setStats] = useState({ total: 0, resolved: 0, emergency: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    setLoading(true)
    const [docRes, casesRes] = await Promise.all([
      supabase.from('doctors').select('*, hospitals(name, city, contact_number)').eq('id', DEMO_DOCTOR_ID).single(),
      supabase.from('cases').select('severity, status'),
    ])
    setDoctor(docRes.data)
    const cases = casesRes.data || []
    setStats({
      total: cases.length,
      resolved: cases.filter(c => c.status === 'resolved').length,
      emergency: cases.filter(c => c.severity === 'Emergency').length,
    })
    setLoading(false)
  }

  if (loading || !doctor) return <div className="empty-state"><p>Loading profile...</p></div>

  return (
    <div>
      <div className="admin-page-header">
        <h1>My Profile</h1>
        <p>Your professional details and performance</p>
      </div>

      {/* Profile Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
            <div className="doc-avatar-lg" style={{ width: 72, height: 72, fontSize: '1.5rem' }}>
              {doctor.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b' }}>{doctor.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                <Stethoscope size={14} /> {doctor.specialization}
              </div>
              <span className={`status-pill ${doctor.availability_status}`} style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                {doctor.availability_status}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="detail-field">
              <label>Hospital Affiliation</label>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building2 size={14} style={{ color: '#64748b' }} />
                {doctor.hospitals?.name || 'Not affiliated'}
              </span>
            </div>
            {doctor.hospitals?.city && (
              <div className="detail-field">
                <label>Location</label>
                <span>{doctor.hospitals.city}</span>
              </div>
            )}
            {doctor.hospitals?.contact_number && (
              <div className="detail-field">
                <label>Hospital Contact</label>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Phone size={14} style={{ color: '#64748b' }} />
                  {doctor.hospitals.contact_number}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Card */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>Performance Overview</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: 12 }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>Total Cases Seen</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4f46e5' }}>{stats.total}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f0fdf4', borderRadius: 12 }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>Cases Resolved</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>{stats.resolved}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#fef2f2', borderRadius: 12 }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>Emergency Handled</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626' }}>{stats.emergency}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#eef2ff', borderRadius: 12 }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>Resolution Rate</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4f46e5' }}>
                {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
