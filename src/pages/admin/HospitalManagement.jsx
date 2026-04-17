import { useState, useEffect } from 'react'
import { X, Plus, Building2 } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'react-hot-toast'

const DEPARTMENTS = ['Cardiology', 'Neurology', 'Orthopedics', 'ENT', 'General', 'Oncology', 'Pediatrics', 'Dermatology', 'Pulmonology', 'Ophthalmology']

export default function HospitalManagement() {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [linkedDoctors, setLinkedDoctors] = useState([])
  const [linkedCases, setLinkedCases] = useState([])
  const [form, setForm] = useState({ name: '', address: '', city: '', contact_number: '', departments: [] })

  useEffect(() => { fetchHospitals() }, [])

  const fetchHospitals = async () => {
    setLoading(true)
    const { data } = await supabase.from('hospitals').select('*').order('name')
    setHospitals(data || [])
    setLoading(false)
  }

  const openDetail = async (h) => {
    setSelected(h)
    const [docRes, caseRes] = await Promise.all([
      supabase.from('doctors').select('*').eq('hospital_id', h.id),
      supabase.from('cases').select('*').eq('assigned_hospital_id', h.id).neq('status', 'resolved'),
    ])
    setLinkedDoctors(docRes.data || [])
    setLinkedCases(caseRes.data || [])
  }

  const toggleDept = (dept) => {
    setForm(prev => {
      const arr = prev.departments.includes(dept) ? prev.departments.filter(d => d !== dept) : [...prev.departments, dept]
      return { ...prev, departments: arr }
    })
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.name || !form.city) { toast.error('Name and city are required.'); return }
    const { error } = await supabase.from('hospitals').insert([{
      name: form.name,
      address: form.address,
      city: form.city,
      contact_number: form.contact_number,
      departments: form.departments,
    }])
    if (error) { toast.error(error.message); return }
    toast.success('Hospital added!')
    setShowForm(false)
    setForm({ name: '', address: '', city: '', contact_number: '', departments: [] })
    fetchHospitals()
  }

  const toggleStatus = async (h) => {
    const next = h.status === 'active' ? 'inactive' : 'active'
    await supabase.from('hospitals').update({ status: next }).eq('id', h.id)
    toast.success(`${h.name} is now ${next}.`)
    fetchHospitals()
  }

  return (
    <div>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Hospital Management</h1>
          <p>Register, manage, and track hospital operations</p>
        </div>
        <button className="action-btn action-btn-primary" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }} onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Hospital
        </button>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3>All Hospitals ({hospitals.length})</h3>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>City</th>
              <th>Departments</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hospitals.map(h => (
              <tr key={h.id}>
                <td style={{ fontWeight: 600 }}>{h.name}</td>
                <td>{h.city}</td>
                <td>
                  <div className="symptom-chips">
                    {(h.departments || []).slice(0, 3).map((d, i) => <span key={i} className="symptom-chip">{d}</span>)}
                    {(h.departments || []).length > 3 && <span className="symptom-chip">+{h.departments.length - 3}</span>}
                  </div>
                </td>
                <td><span className={`status-pill ${h.status}`}>{h.status}</span></td>
                <td style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="action-btn action-btn-primary" onClick={() => openDetail(h)}>Details</button>
                  <button className="action-btn action-btn-danger" onClick={() => toggleStatus(h)}>
                    {h.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {!loading && hospitals.length === 0 && (
              <tr><td colSpan="5" className="empty-state"><p>No hospitals registered.</p></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Hospital Modal */}
      {showForm && (
        <div className="detail-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="detail-modal" onClick={e => e.stopPropagation()}>
            <div className="detail-modal-header">
              <h2>Add New Hospital</h2>
              <button className="action-btn" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} className="detail-modal-body">
              <div className="detail-field">
                <label>Hospital Name</label>
                <input className="table-search" style={{ width: '100%' }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Hospital name" />
              </div>
              <div className="detail-row">
                <div className="detail-field">
                  <label>City</label>
                  <input className="table-search" style={{ width: '100%' }} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="City" />
                </div>
                <div className="detail-field">
                  <label>Contact Number</label>
                  <input className="table-search" style={{ width: '100%' }} value={form.contact_number} onChange={e => setForm({ ...form, contact_number: e.target.value })} placeholder="+91-..." />
                </div>
              </div>
              <div className="detail-field">
                <label>Address</label>
                <input className="table-search" style={{ width: '100%' }} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Full address" />
              </div>
              <div className="detail-field">
                <label>Departments</label>
                <div className="symptom-chips" style={{ gap: '0.4rem' }}>
                  {DEPARTMENTS.map(dept => (
                    <button
                      key={dept} type="button"
                      className="symptom-chip"
                      style={form.departments.includes(dept) ? { background: '#4f46e5', color: 'white' } : {}}
                      onClick={() => toggleDept(dept)}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="action-btn action-btn-primary" style={{ padding: '0.7rem', width: '100%', justifyContent: 'center', fontSize: '0.9rem' }}>Add Hospital</button>
            </form>
          </div>
        </div>
      )}

      {/* Hospital Detail Modal */}
      {selected && (
        <div className="detail-modal-overlay" onClick={() => setSelected(null)}>
          <div className="detail-modal" onClick={e => e.stopPropagation()}>
            <div className="detail-modal-header">
              <h2><Building2 size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />{selected.name}</h2>
              <button className="action-btn" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <div className="detail-modal-body">
              <div className="detail-row">
                <div className="detail-field"><label>City</label><span>{selected.city}</span></div>
                <div className="detail-field"><label>Contact</label><span>{selected.contact_number || '—'}</span></div>
              </div>
              <div className="detail-field"><label>Address</label><span>{selected.address || '—'}</span></div>
              <div className="detail-field">
                <label>Departments</label>
                <div className="symptom-chips">
                  {(selected.departments || []).map((d, i) => <span key={i} className="symptom-chip">{d}</span>)}
                </div>
              </div>

              <div className="detail-field">
                <label>Linked Doctors ({linkedDoctors.length})</label>
                {linkedDoctors.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                    {linkedDoctors.map(d => (
                      <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{d.name}</span>
                        <span className={`status-pill ${d.availability_status}`}>{d.availability_status}</span>
                      </div>
                    ))}
                  </div>
                ) : <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No doctors linked.</span>}
              </div>

              <div className="detail-field">
                <label>Active Emergency Cases ({linkedCases.filter(c => c.severity === 'Emergency').length})</label>
                {linkedCases.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                    {linkedCases.map(c => (
                      <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.patient_name}</span>
                        <span className={`severity-badge ${c.severity.toLowerCase()}`}>{c.severity}</span>
                      </div>
                    ))}
                  </div>
                ) : <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No active cases.</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
