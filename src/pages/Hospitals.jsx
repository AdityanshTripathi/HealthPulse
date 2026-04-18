import { useState, useEffect } from 'react'
import { MapPin, Navigation, Phone, Clock, Star, Filter, Search, ExternalLink, Sparkles } from 'lucide-react'
import './Hospitals.css'

const hospitals = [
  {
    id: 1, name: 'Apollo Hospital', address: 'Greams Road, Chennai 600006',
    distance: '2.3 km', eta: '8 min', rating: 4.8, reviews: 1243,
    type: 'Multi-Specialty', emergency: true, beds: 42,
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Emergency'],
    phone: '+91-44-2829-3333', lat: 13.0604, lng: 80.2496, open24h: true,
  },
  {
    id: 2, name: 'Fortis Healthcare', address: 'Sector 62, Noida 201301',
    distance: '4.1 km', eta: '15 min', rating: 4.6, reviews: 876,
    type: 'Super-Specialty', emergency: true, beds: 28,
    specialties: ['Oncology', 'Cardiology', 'Gastro', 'Emergency'],
    phone: '+91-120-240-0222', lat: 28.6280, lng: 77.3649, open24h: true,
  },
  {
    id: 3, name: 'AIIMS Hospital', address: 'Ansari Nagar, New Delhi 110029',
    distance: '5.7 km', eta: '22 min', rating: 4.9, reviews: 3421,
    type: 'Government Hospital', emergency: true, beds: 156,
    specialties: ['All Specialties', 'Trauma', 'Research'],
    phone: '+91-11-2658-8500', lat: 28.5672, lng: 77.2100, open24h: true,
  },
  {
    id: 4, name: 'Narayana Health', address: 'Bommasandra, Bangalore 560099',
    distance: '8.2 km', eta: '28 min', rating: 4.7, reviews: 654,
    type: 'Multi-Specialty', emergency: true, beds: 67,
    specialties: ['Cardiac Surgery', 'Nephrology', 'Pediatrics'],
    phone: '+91-80-7122-2222', lat: 12.8074, lng: 77.6920, open24h: true,
  },
  {
    id: 5, name: 'Max Healthcare', address: 'Saket, New Delhi 110017',
    distance: '3.5 km', eta: '12 min', rating: 4.5, reviews: 987,
    type: 'Super-Specialty', emergency: true, beds: 35,
    specialties: ['Orthopedics', 'Neurosurgery', 'Oncology'],
    phone: '+91-11-2651-5050', lat: 28.5244, lng: 77.2167, open24h: true,
  },
  {
    id: 6, name: 'Medanta Hospital', address: 'Sector 38, Gurugram 122001',
    distance: '12.4 km', eta: '35 min', rating: 4.8, reviews: 1567,
    type: 'Super-Specialty', emergency: true, beds: 89,
    specialties: ['Liver Transplant', 'Cardiac', 'Robotics Surgery'],
    phone: '+91-124-414-1414', lat: 28.4395, lng: 77.0427, open24h: true,
  },
]

export default function Hospitals() {
  const [search, setSearch] = useState('')
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false)
  const [selectedHospital, setSelectedHospital] = useState(null)

  const filtered = hospitals.filter(h => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.specialties.some(s => s.toLowerCase().includes(search.toLowerCase()))
    const matchEmergency = !showEmergencyOnly || h.emergency
    return matchSearch && matchEmergency
  })

  return (
    <div className="hospitals-page page-enter">
      <div className="container">
        <div className="hospitals-header">
          <div>
            <span className="badge badge-purple"><Sparkles size={12} /> Location-Based</span>
            <h1 className="text-3xl font-bold" style={{ marginTop: 12 }}>Nearby Hospitals</h1>
            <p className="text-muted">Find hospitals near you with real-time availability</p>
          </div>
        </div>

        <div className="hospitals-layout">
          {/* Map Area */}
          <div className="map-area card" id="hospital-map">
            <div className="map-placeholder">
              <div className="map-fake">
                <div className="map-grid-overlay" />
                {hospitals.map((h, i) => (
                  <div
                    key={h.id}
                    className={`map-pin ${selectedHospital === h.id ? 'pin-active' : ''}`}
                    style={{ 
                      left: `${15 + (i * 14)}%`, 
                      top: `${20 + (i % 3) * 25}%` 
                    }}
                    onClick={() => setSelectedHospital(h.id)}
                  >
                    <MapPin size={20} />
                    <span className="pin-label">{h.distance}</span>
                  </div>
                ))}
                <div className="map-center-pin">
                  <Navigation size={18} />
                  <span>You</span>
                </div>
              </div>
              <div className="map-legend">
                <span className="legend-item"><span className="legend-dot" style={{ background: '#0C2924' }} /> Hospital</span>
                <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--routine)' }} /> Your Location</span>
              </div>
            </div>
          </div>

          {/* Hospital List */}
          <div className="hospital-list">
            <div className="list-filters glass">
              <div className="search-bar" style={{ marginBottom: 0 }}>
                <Search size={16} className="search-icon" />
                <input
                  className="search-input"
                  placeholder="Search hospitals..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  id="hospital-search"
                />
              </div>
              <label className="emergency-filter">
                <input type="checkbox" checked={showEmergencyOnly} onChange={e => setShowEmergencyOnly(e.target.checked)} />
                <span>Emergency Only</span>
              </label>
            </div>

            <div className="hospital-cards">
              {filtered.map((h, i) => (
                <div
                  key={h.id}
                  className={`hospital-card card ${selectedHospital === h.id ? 'hospital-selected' : ''}`}
                  onClick={() => setSelectedHospital(h.id)}
                  style={{ animationDelay: `${i * 0.08}s` }}
                  id={`hospital-${h.id}`}
                >
                  <div className="hospital-card-top">
                    <div className="hospital-main-info">
                      <h3>{h.name}</h3>
                      <span className="text-sm text-muted flex items-center gap-2">
                        <MapPin size={12} /> {h.address}
                      </span>
                    </div>
                    <div className="hospital-distance">
                      <span className="dist-value">{h.distance}</span>
                      <span className="text-xs text-muted">{h.eta}</span>
                    </div>
                  </div>

                  <div className="hospital-badges">
                    <span className="badge badge-purple">{h.type}</span>
                    {h.emergency && <span className="badge badge-emergency">24/7 ER</span>}
                    {h.open24h && <span className="badge badge-routine">Open Now</span>}
                  </div>

                  <div className="hospital-specialties">
                    {h.specialties.map((s, j) => (
                      <span key={j} className="spec-tag">{s}</span>
                    ))}
                  </div>

                  <div className="hospital-card-footer">
                    <div className="hospital-rating">
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                      <span className="font-semibold">{h.rating}</span>
                      <span className="text-xs text-muted">({h.reviews})</span>
                    </div>
                    <div className="hospital-beds">
                      <span className="text-sm text-routine">🛏️ {h.beds} beds available</span>
                    </div>
                  </div>

                  <div className="hospital-actions">
                    <a href={`tel:${h.phone}`} className="btn btn-secondary btn-sm">
                      <Phone size={14} />Call
                    </a>
                    <a href={`https://maps.google.com/?q=${h.lat},${h.lng}`} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                      <Navigation size={14} />Get Directions
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
