import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, Star, MapPin, Calendar, Video, Filter,
  Heart, Clock, ChevronDown, CheckCircle2, Stethoscope,
  Brain, Bone, Eye, Baby, Activity, Sparkles
} from 'lucide-react'
import './Doctors.css'

const specialties = [
  { name: 'All', icon: Activity },
  { name: 'Cardiologist', icon: Heart },
  { name: 'Neurologist', icon: Brain },
  { name: 'Orthopedic', icon: Bone },
  { name: 'Ophthalmologist', icon: Eye },
  { name: 'Pediatrician', icon: Baby },
  { name: 'General Physician', icon: Stethoscope },
  { name: 'Pulmonologist', icon: Activity },
]

const doctors = [
  {
    id: 1, name: 'Dr. Rajesh Menon', specialty: 'Cardiologist', rating: 4.9, reviews: 342,
    experience: '15 years', hospital: 'Apollo Hospital, Mumbai', fee: '₹800',
    available: true, nextSlot: '10:30 AM Today', avatar: '👨‍⚕️',
    languages: ['English', 'Hindi', 'Malayalam'], verified: true,
    education: 'MBBS, MD (Cardiology) - AIIMS Delhi'
  },
  {
    id: 2, name: 'Dr. Priya Nair', specialty: 'General Physician', rating: 4.8, reviews: 518,
    experience: '12 years', hospital: 'Fortis Healthcare, Delhi', fee: '₹500',
    available: true, nextSlot: '11:00 AM Today', avatar: '👩‍⚕️',
    languages: ['English', 'Hindi'], verified: true,
    education: 'MBBS, MD (Internal Medicine) - CMC Vellore'
  },
  {
    id: 3, name: 'Dr. Arun Sharma', specialty: 'Pulmonologist', rating: 4.7, reviews: 267,
    experience: '20 years', hospital: 'AIIMS, Delhi', fee: '₹1000',
    available: false, nextSlot: 'Tomorrow 9:00 AM', avatar: '👨‍⚕️',
    languages: ['English', 'Hindi', 'Punjabi'], verified: true,
    education: 'MBBS, DM (Pulmonology) - PGI Chandigarh'
  },
  {
    id: 4, name: 'Dr. Sneha Reddy', specialty: 'Neurologist', rating: 4.9, reviews: 189,
    experience: '10 years', hospital: 'Narayana Health, Bangalore', fee: '₹900',
    available: true, nextSlot: '2:00 PM Today', avatar: '👩‍⚕️',
    languages: ['English', 'Hindi', 'Telugu'], verified: true,
    education: 'MBBS, DM (Neurology) - NIMHANS'
  },
  {
    id: 5, name: 'Dr. Vikram Singh', specialty: 'Orthopedic', rating: 4.6, reviews: 412,
    experience: '18 years', hospital: 'Max Healthcare, Delhi', fee: '₹700',
    available: true, nextSlot: '3:30 PM Today', avatar: '👨‍⚕️',
    languages: ['English', 'Hindi'], verified: true,
    education: 'MBBS, MS (Ortho) - Safdarjung Hospital'
  },
  {
    id: 6, name: 'Dr. Meera Iyer', specialty: 'Pediatrician', rating: 4.8, reviews: 623,
    experience: '14 years', hospital: 'Rainbow Children\'s, Chennai', fee: '₹600',
    available: true, nextSlot: '4:00 PM Today', avatar: '👩‍⚕️',
    languages: ['English', 'Hindi', 'Tamil'], verified: true,
    education: 'MBBS, MD (Pediatrics) - KEM Mumbai'
  },
]

export default function Doctors() {
  const [search, setSearch] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('All')
  const [sortBy, setSortBy] = useState('rating')

  const filtered = doctors
    .filter(d => {
      const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.specialty.toLowerCase().includes(search.toLowerCase())
      const matchSpecialty = selectedSpecialty === 'All' || d.specialty === selectedSpecialty
      return matchSearch && matchSpecialty
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'fee') return parseInt(a.fee.replace('₹', '')) - parseInt(b.fee.replace('₹', ''))
      return 0
    })

  return (
    <div className="doctors-page page-enter">
      <div className="container">
        <div className="doctors-header">
          <div>
            <span className="badge badge-purple"><Sparkles size={12} /> AI-Matched Specialists</span>
            <h1 className="text-3xl font-bold" style={{ marginTop: 12 }}>Find the Right Doctor</h1>
            <p className="text-muted">Verified specialists matched to your health needs</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="doctors-filters glass">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              className="search-input"
              placeholder="Search doctors, specialties..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="doctor-search"
            />
          </div>

          <div className="specialty-tabs">
            {specialties.map((s, i) => (
              <button
                key={i}
                className={`specialty-tab ${selectedSpecialty === s.name ? 'tab-active' : ''}`}
                onClick={() => setSelectedSpecialty(s.name)}
              >
                <s.icon size={14} />
                <span>{s.name}</span>
              </button>
            ))}
          </div>

          <div className="filter-bar">
            <span className="text-sm text-muted">{filtered.length} doctors found</span>
            <div className="sort-dropdown">
              <Filter size={14} />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
                <option value="rating">Highest Rated</option>
                <option value="fee">Lowest Fee</option>
              </select>
            </div>
          </div>
        </div>

        {/* Doctor Cards */}
        <div className="doctors-grid">
          {filtered.map((doc, i) => (
            <div key={doc.id} className="doctor-card card card-glow" style={{ animationDelay: `${i * 0.08}s` }} id={`doctor-card-${doc.id}`}>
              <div className="doctor-card-header">
                <div className="doctor-avatar-wrap">
                  <span className="doctor-avatar-emoji">{doc.avatar}</span>
                  {doc.available && <span className="online-dot" />}
                </div>
                <div className="doctor-info">
                  <div className="doctor-name-row">
                    <h3>{doc.name}</h3>
                    {doc.verified && <CheckCircle2 size={16} className="verified-icon" />}
                  </div>
                  <span className="text-sm text-purple">{doc.specialty}</span>
                  <span className="text-xs text-muted">{doc.education}</span>
                </div>
                <div className="doctor-rating">
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <span className="font-bold">{doc.rating}</span>
                  <span className="text-xs text-muted">({doc.reviews})</span>
                </div>
              </div>

              <div className="doctor-meta">
                <span><MapPin size={14} /> {doc.hospital}</span>
                <span><Clock size={14} /> {doc.experience}</span>
              </div>

              <div className="doctor-tags">
                {doc.languages.map((l, j) => (
                  <span key={j} className="lang-tag">{l}</span>
                ))}
              </div>

              <div className="doctor-footer">
                <div className="doctor-fee">
                  <span className="fee-amount">{doc.fee}</span>
                  <span className="text-xs text-muted">per consultation</span>
                </div>
                <div className="doctor-slot">
                  <Clock size={12} />
                  <span className="text-xs">{doc.nextSlot}</span>
                </div>
              </div>

              <div className="doctor-actions">
                <Link to="/appointment" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                  <Calendar size={14} />
                  Book Appointment
                </Link>
                <Link to="/consult" className="btn btn-secondary btn-sm">
                  <Video size={14} />
                  Video
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
