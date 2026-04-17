import { useState, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'react-hot-toast'

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', specialization: '', hospital_id: '', availability_status: 'online' })

  useEffect(() => { fetchDoctors(); fetchHospitals() }, [])

  const fetchDoctors = async () => {
    setLoading(true)
    const { data } = await supabase.from('doctors').select('*, hospitals(name)').order('name')
    setDoctors(data || [])
    setLoading(false)
  }

  const fetchHospitals = async () => {
    const { data } = await supabase.from('hospitals').select('id, name').eq('status', 'active')
    setHospitals(data || [])
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.name || !form.specialization) { toast.error('Name and specialization are required.'); return }
    const { error } = await supabase.from('doctors').insert([{
      name: form.name,
      specialization: form.specialization,
      hospital_id: form.hospital_id || null,
      availability_status: form.availability_status,
    }])
    if (error) { toast.error(error.message); return }
    toast.success('Doctor added successfully.')
    setShowForm(false)
    setForm({ name: '', specialization: '', hospital_id: '', availability_status: 'online' })
    fetchDoctors()
  }

  const toggleAvailability = async (doc) => {
    const next = doc.availability_status === 'online' ? 'offline' : 'online'
    await supabase.from('doctors').update({ availability_status: next }).eq('id', doc.id)
    toast.success(`${doc.name} is now ${next}.`)
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
          <p>Add, edit, and manage your doctor network</p>
        </div>
        <button className="action-btn action-btn-primary" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }} onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Doctor
        </button>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3>All Doctors ({doctors.length})</h3>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Specialization</th>
              <th>Hospital</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map(d => (
              <tr key={d.id}>
                <td style={{ fontWeight: 600 }}>{d.name}</td>
                <td>{d.specialization}</td>
                <td>{d.hospitals?.name || '—'}</td>
                <td>
                  <span className={`status-pill ${d.availability_status}`}>
                    {d.availability_status}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="action-btn action-btn-primary" onClick={() => toggleAvailability(d)}>
                    Toggle
                  </button>
                  <button className="action-btn action-btn-danger" onClick={() => removeDoctor(d.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {!loading && doctors.length === 0 && (
              <tr><td colSpan="5" className="empty-state"><p>No doctors registered yet.</p></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Doctor Modal */}
      {showForm && (
        <div className="detail-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="detail-modal" onClick={e => e.stopPropagation()}>
            <div className="detail-modal-header">
              <h2>Add New Doctor</h2>
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
              <div className="detail-field">
                <label>Hospital</label>
                <select className="table-search" style={{ width: '100%' }} value={form.hospital_id} onChange={e => setForm({ ...form, hospital_id: e.target.value })}>
                  <option value="">— Select Hospital —</option>
                  {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <button type="submit" className="action-btn action-btn-primary" style={{ padding: '0.7rem', width: '100%', justifyContent: 'center', fontSize: '0.9rem' }}>Add Doctor</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
