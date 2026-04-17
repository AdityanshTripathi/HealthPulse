import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'react-hot-toast'

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchAppointments() }, [])

  const fetchAppointments = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('appointments')
      .select('*, doctors(name), hospitals(name)')
      .order('slot_time', { ascending: true })
    setAppointments(data || [])
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    await supabase.from('appointments').update({ status }).eq('id', id)
    toast.success(`Appointment marked as ${status}.`)
    fetchAppointments()
  }

  const filtered = appointments.filter(a => {
    if (filter === 'all') return true
    return a.status === filter
  })

  const formatTime = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' +
      d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Appointment Management</h1>
        <p>Track, confirm, and manage patient appointments</p>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3>All Appointments ({filtered.length})</h3>
          <div className="table-filters">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
              <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Hospital</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id}>
                <td style={{ fontWeight: 600 }}>{a.patient_name}</td>
                <td>{a.doctors?.name || '—'}</td>
                <td>{a.hospitals?.name || '—'}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{formatTime(a.slot_time)}</td>
                <td><span className={`status-pill ${a.status}`}>{a.status}</span></td>
                <td style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {a.status === 'pending' && (
                    <button className="action-btn action-btn-success" onClick={() => updateStatus(a.id, 'confirmed')}>Confirm</button>
                  )}
                  {(a.status === 'pending' || a.status === 'confirmed') && (
                    <button className="action-btn action-btn-danger" onClick={() => updateStatus(a.id, 'cancelled')}>Cancel</button>
                  )}
                  {a.status === 'confirmed' && (
                    <button className="action-btn action-btn-primary" onClick={() => updateStatus(a.id, 'completed')}>Complete</button>
                  )}
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan="6" className="empty-state"><p>No appointments found.</p></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
