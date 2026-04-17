import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import {
  AlertTriangle, Shield, Activity, Stethoscope, Clock,
  ArrowRight, Heart, Brain, TrendingUp, Phone, Video,
  Calendar, MapPin, CheckCircle2, ChevronRight, Zap, Sparkles
} from 'lucide-react'
import './Results.css'

const conditionData = {
  emergency: {
    label: 'EMERGENCY',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.3)',
    icon: AlertTriangle,
    description: 'Immediate medical attention required. Do not delay treatment.',
    action: 'Call ambulance or visit nearest ER immediately.',
  },
  urgent: {
    label: 'URGENT',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.1)',
    border: 'rgba(249,115,22,0.3)',
    icon: Clock,
    description: 'Medical attention needed within 24 hours.',
    action: 'Schedule an urgent appointment or video consultation.',
  },
  routine: {
    label: 'ROUTINE',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.3)',
    icon: Shield,
    description: 'Non-urgent condition. Schedule regular consultation.',
    action: 'Book an appointment at your convenience.',
  }
}

const analysisBreakdown = [
  { label: 'Cardiac Risk', value: 72, color: '#ef4444' },
  { label: 'Respiratory Function', value: 45, color: '#f97316' },
  { label: 'Neurological Risk', value: 28, color: '#10b981' },
  { label: 'Infection Probability', value: 34, color: '#2563eb' },
  { label: 'Pain Severity', value: 65, color: '#a855f7' },
]

const recommendedDoctors = [
  { name: 'Dr. Rajesh Menon', specialty: 'Cardiologist', rating: 4.9, available: true, exp: '15 yrs', hospital: 'Apollo Hospital, Mumbai', image: '👨‍⚕️' },
  { name: 'Dr. Priya Nair', specialty: 'General Physician', rating: 4.8, available: true, exp: '12 yrs', hospital: 'Fortis Healthcare, Delhi', image: '👩‍⚕️' },
  { name: 'Dr. Arun Sharma', specialty: 'Pulmonologist', rating: 4.7, available: false, exp: '20 yrs', hospital: 'AIIMS, Delhi', image: '👨‍⚕️' },
]

export default function Results() {
  const location = useLocation()
  const { score = 73, symptoms = ['Chest pain', 'Shortness of breath', 'Dizziness'] } = location.state || {}
  const [animatedScore, setAnimatedScore] = useState(0)
  const [showBreakdown, setShowBreakdown] = useState(false)

  const classification = score >= 75 ? 'emergency' : score >= 50 ? 'urgent' : 'routine'
  const condition = conditionData[classification]
  const CondIcon = condition.icon

  useEffect(() => {
    let current = 0
    const timer = setInterval(() => {
      current += 1
      if (current >= score) { setAnimatedScore(score); clearInterval(timer); return }
      setAnimatedScore(current)
    }, 20)
    setTimeout(() => setShowBreakdown(true), 1000)
    return () => clearInterval(timer)
  }, [score])

  const circumference = 2 * Math.PI * 70
  const offset = circumference - (animatedScore / 100) * circumference

  return (
    <div className="results-page page-enter">
      <div className="container">
        <div className="results-header">
          <span className="badge badge-purple"><Sparkles size={12} /> AI Analysis Complete</span>
          <h1 className="text-3xl font-bold">Your Triage Results</h1>
          <p className="text-muted">Based on {symptoms.length} symptom indicators analyzed by HealthPulse AI</p>
        </div>

        <div className="results-grid">
          {/* Score Card */}
          <div className="score-card card" id="risk-score-card">
            <div className="score-visual">
              <svg className="score-ring" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" fill="none" stroke="var(--bg-surface)" strokeWidth="8" />
                <circle
                  cx="80" cy="80" r="70" fill="none"
                  stroke={condition.color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  transform="rotate(-90 80 80)"
                  style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)' }}
                />
              </svg>
              <div className="score-value">
                <span className="score-number" style={{ color: condition.color }}>{animatedScore}</span>
                <span className="score-label">/ 100</span>
              </div>
            </div>

            <div className="score-badge" style={{ background: condition.bg, borderColor: condition.border, color: condition.color }}>
              <CondIcon size={16} />
              {condition.label}
            </div>

            <p className="text-muted text-sm text-center">{condition.description}</p>

            <div className="score-action" style={{ background: condition.bg, borderColor: condition.border }}>
              <CondIcon size={16} style={{ color: condition.color }} />
              <span style={{ color: condition.color }}>{condition.action}</span>
            </div>
          </div>

          {/* Analysis Breakdown */}
          <div className="breakdown-card card" id="analysis-breakdown">
            <h3 className="flex items-center gap-2">
              <Brain size={18} className="text-purple" />
              AI Analysis Breakdown
            </h3>

            <div className="symptom-tags">
              <span className="text-sm text-muted">Symptoms analyzed:</span>
              <div className="flex gap-2" style={{ flexWrap: 'wrap', marginTop: 8 }}>
                {symptoms.map((s, i) => (
                  <span key={i} className="badge badge-purple">{s}</span>
                ))}
              </div>
            </div>

            <div className="breakdown-bars">
              {analysisBreakdown.map((item, i) => (
                <div key={i} className="breakdown-item" style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="breakdown-header">
                    <span className="text-sm">{item.label}</span>
                    <span className="text-sm font-semibold" style={{ color: item.color }}>{showBreakdown ? item.value : 0}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: showBreakdown ? `${item.value}%` : '0%', background: item.color }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="confidence-badge">
              <CheckCircle2 size={14} />
              <span>AI Confidence: <strong>94.2%</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Zap size={20} className="text-purple" />
            Recommended Actions
          </h3>
          <div className="actions-grid">
            <Link to="/doctors" className="action-card card card-glow">
              <Stethoscope size={28} className="text-purple" />
              <h4>Book a Doctor</h4>
              <p className="text-sm text-muted">Connect with a specialist matched to your condition</p>
              <span className="action-arrow"><ArrowRight size={16} /></span>
            </Link>
            <Link to="/consult" className="action-card card card-glow">
              <Video size={28} style={{ color: '#06b6d4' }} />
              <h4>Video Consult</h4>
              <p className="text-sm text-muted">Start a live video consultation with an available doctor</p>
              <span className="action-arrow"><ArrowRight size={16} /></span>
            </Link>
            <Link to="/hospitals" className="action-card card card-glow">
              <MapPin size={28} style={{ color: '#10b981' }} />
              <h4>Find Hospital</h4>
              <p className="text-sm text-muted">Locate the nearest hospital with relevant specialization</p>
              <span className="action-arrow"><ArrowRight size={16} /></span>
            </Link>
            {classification === 'emergency' && (
              <Link to="/emergency" className="action-card card" style={{ borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.05)' }}>
                <Phone size={28} className="text-emergency" />
                <h4 style={{ color: 'var(--emergency)' }}>Emergency SOS</h4>
                <p className="text-sm text-muted">Dispatch ambulance immediately to your location</p>
                <span className="action-arrow" style={{ color: 'var(--emergency)' }}><ArrowRight size={16} /></span>
              </Link>
            )}
          </div>
        </div>

        {/* Doctor Recommendation */}
        <div className="doctor-recs" id="doctor-recommendations">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Heart size={20} className="text-purple" />
            Recommended Specialists
          </h3>
          <div className="doctor-rec-grid">
            {recommendedDoctors.map((doc, i) => (
              <div key={i} className="doctor-rec-card card card-glow">
                <div className="doc-header">
                  <span className="doc-avatar">{doc.image}</span>
                  <div>
                    <h4>{doc.name}</h4>
                    <span className="text-sm text-purple">{doc.specialty}</span>
                  </div>
                  <span className={`badge ${doc.available ? 'badge-routine' : 'badge-urgent'}`}>
                    {doc.available ? 'Available' : 'Busy'}
                  </span>
                </div>
                <div className="doc-details">
                  <span className="text-sm text-muted">⭐ {doc.rating}</span>
                  <span className="text-sm text-muted">🏥 {doc.hospital}</span>
                  <span className="text-sm text-muted">📅 {doc.exp} experience</span>
                </div>
                <div className="doc-actions">
                  <Link to="/appointment" className="btn btn-primary btn-sm">
                    <Calendar size={14} />
                    Book
                  </Link>
                  <Link to="/consult" className="btn btn-secondary btn-sm">
                    <Video size={14} />
                    Video Call
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
