import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'react-hot-toast'

const DEMO_HOSPITAL_ID = 'a1b2c3d4-0001-4000-a000-000000000001'

export default function HospitalDoctors() {
  const [doctors, setDoctors] = useState([])
  const [caseLoads, setCaseLoads] = useState({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', specialization: '', availability_status: 'online' })

  useEffect(() => { fetchDoctors() }, [])

  const fetchDoctors = async () => {
    setLoading(true)
    const { data: docs } = await supabase.from('doctors').select('*').eq('hospital_id', DEMO_HOSPITAL_ID).order('name')
    setDoctors(docs || [])

    // Calculate case loads
    const { data: cases } = await supabase.from('cases').select('assigned_doctor_id').neq('status', 'resolved')
    const loads = {}
    ;(cases || []).forEach(c => {
      if (c.assigned_doctor_id) loads[c.assigned_doctor_id] = (loads[c.assigned_doctor_id] || 0) + 1
    })
    setCaseLoads(loads)
    setLoading(false)
  }

  const toggleAvailability = async (doc) => {
    const next = doc.availability_status === 'online' ? 'offline' : 'online'
    await supabase.from('doctors').update({ availability_status: next }).eq('id', doc.id)
    toast.success(`${doc.name} is now ${next}.`)
    fetchDoctors()
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.name || !form.specialization) { toast.error('Please fill all fields.'); return }
    const { error } = await supabase.from('doctors').insert([{ ...form, hospital_id: DEMO_HOSPITAL_ID }])
    if (error) { toast.error(error.message); return }
    toast.success('Doctor added!')
    setShowForm(false)
    setForm({ name: '', specialization: '', availability_status: 'online' })
    fetchDoctors()
  }

  const removeDoctor = async (id) => {
    await supabase.from('doctors').delete().eq('id', id)
    toast.success('Doctor removed.')
    fetchDoctors()
  }

  return (
    <div>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Doctor Management</h1>
          <p>Manage doctors, toggle availability, and view workloads</p>
        </div>
        <button className="action-btn action-btn-primary" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }} onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Doctor
        </button>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header"><h3>Hospital Doctors ({doctors.length})</h3></div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Specialization</th>
              <th>Status</th>
              <th>Active Cases</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map(d => (
              <tr key={d.id}>
                <td style={{ fontWeight: 600 }}>{d.name}</td>
                <td>{d.specialization}</td>
                <td><span className={`status-pill ${d.availability_status}`}>{d.availability_status}</span></td>
                <td>
                  <span style={{ fontWeight: 700, color: (caseLoads[d.id] || 0) > 2 ? '#dc2626' : '#334155' }}>
                    {caseLoads[d.id] || 0}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="action-btn action-btn-primary" onClick={() => toggleAvailability(d)}>
                    {d.availability_status === 'online' ? 'Set Offline' : 'Set Online'}
                  </button>
                  <button className="action-btn action-btn-danger" onClick={() => removeDoctor(d.id)}>Remove</button>
                </td>
              </tr>
            ))}
            {!loading && doctors.length === 0 && <tr><td colSpan="5" className="empty-state"><p>No doctors.</p></td></tr>}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="detail-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="detail-modal" onClick={e => e.stopPropagation()}>
            <div className="detail-modal-header">
              <h2>Add Doctor</h2>
              <button className="action-btn" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} className="detail-modal-body">
              <div className="detail-field">
                <label>Full Name</label>
                <input className="table-search" style={{ width: '100%' }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Dr. ..." />
              </div>
              <div className="detail-field">
                <label>Specialization</label>
                <input className="table-search" style={{ width: '100%' }} value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} placeholder="Cardiologist" />
              </div>
              <button type="submit" className="action-btn action-btn-primary" style={{ padding: '0.7rem', width: '100%', justifyContent: 'center', fontSize: '0.9rem' }}>Add Doctor</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
