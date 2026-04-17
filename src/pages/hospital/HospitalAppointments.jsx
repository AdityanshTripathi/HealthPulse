import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'react-hot-toast'

const DEMO_HOSPITAL_ID = 'a1b2c3d4-0001-4000-a000-000000000001'

export default function HospitalAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchAppointments() }, [])

  const fetchAppointments = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('appointments')
      .select('*, doctors(name)')
      .eq('hospital_id', DEMO_HOSPITAL_ID)
      .order('slot_time', { ascending: true })
    setAppointments(data || [])
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    await supabase.from('appointments').update({ status }).eq('id', id)
    toast.success(`Appointment ${status}.`)
    fetchAppointments()
  }

  const formatDT = (iso) => {
    const d = new Date(iso)
    const isToday = d.toDateString() === new Date().toDateString()
    return {
      date: isToday ? 'Today' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      isToday,
    }
  }

  const filtered = appointments.filter(a => {
    if (filter === 'all') return true
    if (filter === 'today') return new Date(a.slot_time).toDateString() === new Date().toDateString()
    return a.status === filter
  })

  return (
    <div>
      <div className="admin-page-header">
        <h1>Appointment Management</h1>
        <p>Manage bookings, confirmations, and scheduling</p>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3>Appointments ({filtered.length})</h3>
          <div className="table-filters">
            {['all', 'today', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
              <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f === 'today' ? 'Today' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Notes</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => {
              const { date, time, isToday } = formatDT(a.slot_time)
              return (
                <tr key={a.id} style={isToday ? { background: '#fefce8' } : {}}>
                  <td style={{ fontWeight: 600 }}>{a.patient_name}</td>
                  <td>{a.doctors?.name || '—'}</td>
                  <td>{isToday ? <span style={{ color: '#2563eb', fontWeight: 700 }}>Today</span> : date}</td>
                  <td style={{ fontWeight: 600 }}>{time}</td>
                  <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.notes || '—'}</td>
                  <td><span className={`status-pill ${a.status}`}>{a.status}</span></td>
                  <td style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {a.status === 'pending' && (
                      <>
                        <button className="action-btn action-btn-success" onClick={() => updateStatus(a.id, 'confirmed')}>Confirm</button>
                        <button className="action-btn action-btn-danger" onClick={() => updateStatus(a.id, 'cancelled')}>Cancel</button>
                      </>
                    )}
                    {a.status === 'confirmed' && (
                      <>
                        <button className="action-btn action-btn-primary" onClick={() => updateStatus(a.id, 'completed')}>Complete</button>
                        <button className="action-btn action-btn-danger" onClick={() => updateStatus(a.id, 'cancelled')}>Cancel</button>
                      </>
                    )}
                    {a.status === 'cancelled' && (
                      <button className="action-btn action-btn-primary" onClick={() => updateStatus(a.id, 'pending')}>Reschedule</button>
                    )}
                  </td>
                </tr>
              )
            })}
            {!loading && filtered.length === 0 && <tr><td colSpan="7" className="empty-state"><p>No appointments.</p></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
