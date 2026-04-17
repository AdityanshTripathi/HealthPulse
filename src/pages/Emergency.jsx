import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Phone, MapPin, Navigation, AlertTriangle, Heart,
  Share2, Users, Clock, Shield, ArrowRight, Radio,
  PhoneCall, Siren
} from 'lucide-react'
import './Emergency.css'

export default function Emergency() {
  const [countdown, setCountdown] = useState(null)
  const [dispatched, setDispatched] = useState(false)
  const [locationShared, setLocationShared] = useState(false)
  const [pulseCount, setPulseCount] = useState(0)

  useEffect(() => {
    const p = setInterval(() => setPulseCount(c => c + 1), 2000)
    return () => clearInterval(p)
  }, [])

  useEffect(() => {
    if (countdown === null) return
    if (countdown <= 0) {
      setDispatched(true)
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const handleDispatch = () => {
    setCountdown(5)
  }

  const handleShareLocation = () => {
    setLocationShared(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setLocationShared(true),
        () => setLocationShared(true)
      )
    }
  }

  const cancelDispatch = () => {
    setCountdown(null)
    setDispatched(false)
  }

  return (
    <div className="emergency-page page-enter">
      {/* Full-screen Emergency Background */}
      <div className="emergency-bg">
        <div className="emergency-pulse-ring" />
        <div className="emergency-pulse-ring" style={{ animationDelay: '1s' }} />
        <div className="emergency-pulse-ring" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container emergency-content">
        {!dispatched ? (
          <>
            {/* Emergency Header */}
            <div className="emergency-header">
              <div className="emergency-icon-wrap">
                <AlertTriangle size={40} />
              </div>
              <h1 className="text-5xl font-black">EMERGENCY SOS</h1>
              <p className="text-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>
                One tap to dispatch ambulance to your location
              </p>
            </div>

            {/* Main SOS Button */}
            <div className="sos-button-wrap">
              {countdown !== null && countdown > 0 ? (
                <div className="sos-countdown">
                  <span className="countdown-number">{countdown}</span>
                  <span className="countdown-label">Dispatching in...</span>
                  <button className="btn btn-secondary" onClick={cancelDispatch} style={{ marginTop: 16 }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button className="sos-button" onClick={handleDispatch} id="sos-dispatch-btn">
                  <Siren size={48} />
                  <span className="sos-text">CALL AMBULANCE</span>
                  <span className="sos-sub">Tap to dispatch</span>
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="emergency-actions">
              <a href="tel:112" className="emergency-action-card">
                <PhoneCall size={28} />
                <span className="action-label">Call 112</span>
                <span className="action-desc">National Emergency</span>
              </a>
              <a href="tel:108" className="emergency-action-card">
                <Phone size={28} />
                <span className="action-label">Call 108</span>
                <span className="action-desc">Medical Ambulance</span>
              </a>
              <button className="emergency-action-card" onClick={handleShareLocation}>
                <MapPin size={28} />
                <span className="action-label">{locationShared ? 'Shared ✓' : 'Share Location'}</span>
                <span className="action-desc">Send to contacts</span>
              </button>
              <button className="emergency-action-card" onClick={() => {}}>
                <Users size={28} />
                <span className="action-label">Alert Family</span>
                <span className="action-desc">Notify emergency contacts</span>
              </button>
            </div>

            {/* Nearest ER */}
            <div className="nearest-er glass">
              <div className="er-header">
                <Navigation size={16} />
                <span className="font-semibold">Nearest Emergency Room</span>
              </div>
              <div className="er-details">
                <div>
                  <h3>Apollo Hospital ER</h3>
                  <span className="text-sm text-muted">Greams Road, Chennai - 2.3 km • 8 min ETA</span>
                </div>
                <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                  <Navigation size={14} />
                  Navigate
                </a>
              </div>
              <div className="er-status">
                <span className="badge badge-routine">🟢 ER Open - 5 beds available</span>
                <span className="badge badge-emergency">🔴 Trauma Center Active</span>
              </div>
            </div>

            {/* First Aid Tips */}
            <div className="first-aid glass">
              <h3 className="flex items-center gap-2">
                <Heart size={18} style={{ color: 'var(--emergency)' }} />
                While Waiting — Quick First Aid
              </h3>
              <div className="first-aid-grid">
                <div className="first-aid-item">
                  <span className="step-num">1</span>
                  <span>Stay calm and keep the patient comfortable</span>
                </div>
                <div className="first-aid-item">
                  <span className="step-num">2</span>
                  <span>Check airway, breathing, and circulation (ABCs)</span>
                </div>
                <div className="first-aid-item">
                  <span className="step-num">3</span>
                  <span>For chest pain: sit them upright, loosen clothing</span>
                </div>
                <div className="first-aid-item">
                  <span className="step-num">4</span>
                  <span>For bleeding: apply pressure with clean cloth</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Dispatched State */
          <div className="dispatch-confirmed">
            <div className="dispatch-icon">
              <Shield size={48} />
            </div>
            <h1 className="text-4xl font-black">AMBULANCE DISPATCHED</h1>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Help is on the way. Stay calm.
            </p>

            <div className="dispatch-tracker glass">
              <div className="tracker-item">
                <Radio size={20} />
                <div>
                  <span className="font-semibold">Ambulance #AMB-2847</span>
                  <span className="text-sm text-muted">Apollo Hospital Fleet</span>
                </div>
                <span className="badge badge-routine">En Route</span>
              </div>
              <div className="tracker-eta">
                <Clock size={20} />
                <span className="eta-time">ETA: 8 minutes</span>
              </div>
              <div className="tracker-progress">
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: '35%', background: 'var(--emergency)' }} />
                </div>
                <span className="text-xs text-muted">2.3 km away</span>
              </div>
            </div>

            <div className="dispatch-actions">
              <a href="tel:112" className="btn btn-danger btn-lg">
                <Phone size={18} />
                Call Emergency Line
              </a>
              <button className="btn btn-secondary btn-lg" onClick={cancelDispatch}>
                Back to SOS
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
