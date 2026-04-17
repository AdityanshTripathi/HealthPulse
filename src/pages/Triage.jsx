import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mic, MicOff, Brain, Activity, Sparkles, AlertTriangle,
  ChevronRight, User, Heart, Plus, Search, Zap,
  Thermometer, Wind, Bone, ShieldAlert, Info
} from 'lucide-react'
import './Triage.css'

const existingConditions = ['Diabetes', 'High BP', 'Asthma', 'Heart Issues', 'Thyroid', 'PCOD', 'None']

const symptomCategories = [
  {
    id: 'general',
    title: 'General Symptoms',
    icon: Thermometer,
    color: '#10b981',
    severity: 'mild',
    symptoms: [
      { name: 'Fever', severity: 'mild' },
      { name: 'Headache', severity: 'mild' },
      { name: 'Weakness / Fatigue', severity: 'mild' },
      { name: 'Vomiting', severity: 'moderate' },
      { name: 'Body Ache', severity: 'mild' },
      { name: 'Loss of Appetite', severity: 'mild' },
      { name: 'Dizziness', severity: 'moderate' },
      { name: 'Night Sweats', severity: 'mild' },
    ],
  },
  {
    id: 'pain',
    title: 'Pain',
    icon: Zap,
    color: '#f97316',
    severity: 'moderate',
    symptoms: [
      { name: 'Chest Pain', severity: 'critical' },
      { name: 'Stomach Pain', severity: 'moderate' },
      { name: 'Back Pain', severity: 'moderate' },
      { name: 'Joint Pain', severity: 'mild' },
      { name: 'Neck Pain', severity: 'moderate' },
      { name: 'Pelvic Pain', severity: 'moderate' },
    ],
  },
  {
    id: 'respiratory',
    title: 'Respiratory',
    icon: Wind,
    color: '#2563eb',
    severity: 'moderate',
    symptoms: [
      { name: 'Cough', severity: 'mild' },
      { name: 'Breathing Difficulty', severity: 'critical' },
      { name: 'Sore Throat', severity: 'mild' },
      { name: 'Wheezing', severity: 'moderate' },
      { name: 'Congestion', severity: 'mild' },
      { name: 'Coughing Blood', severity: 'critical' },
    ],
  },
  {
    id: 'critical',
    title: 'Critical / Emergency',
    icon: ShieldAlert,
    color: '#ef4444',
    severity: 'critical',
    symptoms: [
      { name: 'Severe Chest Pain', severity: 'critical' },
      { name: 'Unconscious / Fainting', severity: 'critical' },
      { name: 'Heavy Bleeding', severity: 'critical' },
      { name: 'Seizures', severity: 'critical' },
      { name: 'Sudden Paralysis', severity: 'critical' },
      { name: 'Severe Allergic Reaction', severity: 'critical' },
    ],
  },
]

const durationOptions = ['Few hours', '1 day', '2–3 days', '1 week', 'More than a week']

export default function Triage() {
  const navigate = useNavigate()

  // User details
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [conditions, setConditions] = useState([])
  const [menstrualInfo, setMenstrualInfo] = useState('')

  // Symptoms
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [customSymptom, setCustomSymptom] = useState('')
  const [isListening, setIsListening] = useState(false)

  // Context
  const [duration, setDuration] = useState('')
  const [severity, setSeverity] = useState(5)

  // UI
  const [activeCategory, setActiveCategory] = useState('general')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const toggleCondition = (cond) => {
    if (cond === 'None') {
      setConditions(['None'])
      return
    }
    setConditions(prev => {
      const filtered = prev.filter(c => c !== 'None')
      return filtered.includes(cond) ? filtered.filter(c => c !== cond) : [...filtered, cond]
    })
  }

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    )
  }

  const addCustomSymptom = () => {
    if (!customSymptom.trim()) return
    if (!selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms(prev => [...prev, customSymptom.trim()])
    }
    setCustomSymptom('')
  }

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice not supported. Please use Chrome.')
      return
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.continuous = false

    if (isListening) { setIsListening(false); return }

    setIsListening(true)
    recognition.start()
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setCustomSymptom(transcript)
      setIsListening(false)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
  }

  const getSeverityLabel = (val) => {
    if (val <= 3) return { text: 'Mild', color: '#10b981' }
    if (val <= 6) return { text: 'Moderate', color: '#f97316' }
    return { text: 'Severe', color: '#ef4444' }
  }

  const severityInfo = getSeverityLabel(severity)

  const hasCritical = selectedSymptoms.some(s => {
    for (const cat of symptomCategories) {
      const found = cat.symptoms.find(sym => sym.name === s)
      if (found && found.severity === 'critical') return true
    }
    return false
  })

  const canSubmit = age && gender && selectedSymptoms.length > 0 && duration

  const handleAnalyze = () => {
    if (!canSubmit) return
    setIsAnalyzing(true)

    // Simulate AI analysis
    setTimeout(() => {
      let baseScore = severity * 5
      baseScore += selectedSymptoms.length * 8
      if (hasCritical) baseScore += 30
      if (conditions.includes('Heart Issues')) baseScore += 10
      if (conditions.includes('High BP')) baseScore += 5
      if (parseInt(age) > 60) baseScore += 10
      const score = Math.min(Math.max(baseScore, 15), 98)

      navigate('/results', {
        state: {
          score,
          symptoms: selectedSymptoms,
          age,
          gender,
          conditions,
          duration,
          severity,
        }
      })
    }, 2500)
  }

  const activeCat = symptomCategories.find(c => c.id === activeCategory)

  return (
    <div className="triage-page page-enter">
      <div className="triage-container">
        {/* Header */}
        <div className="triage-header">
          <span className="badge badge-purple">
            <Sparkles size={12} />
            AI-Powered Triage
          </span>
          <h1 className="text-3xl font-bold">Smart Symptom Checker</h1>
          <p className="text-muted">Tell us about yourself and your symptoms — our AI will analyze and guide you.</p>
        </div>

        {/* Disclaimer */}
        <div className="triage-disclaimer">
          <Info size={16} />
          <span>This tool provides preliminary guidance only and does not replace professional medical advice. In emergencies, call <strong>112</strong> immediately.</span>
        </div>

        {/* ═════════════ SECTION 1: USER DETAILS ═════════════ */}
        <div className="triage-section" id="user-details-section">
          <div className="section-label">
            <User size={18} />
            <span>Basic Details</span>
          </div>

          <div className="details-grid">
            {/* Age */}
            <div className="detail-field">
              <label>Age</label>
              <input
                type="number"
                className="detail-input"
                placeholder="e.g. 28"
                value={age}
                onChange={e => setAge(e.target.value)}
                min="1" max="120"
                id="age-input"
              />
            </div>

            {/* Gender */}
            <div className="detail-field">
              <label>Gender</label>
              <div className="gender-btns">
                {['Male', 'Female', 'Other'].map(g => (
                  <button
                    key={g}
                    className={`gender-btn ${gender === g ? 'gender-active' : ''}`}
                    onClick={() => setGender(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Existing Conditions */}
          <div className="detail-field" style={{ marginTop: 16 }}>
            <label>Existing Conditions</label>
            <div className="condition-chips">
              {existingConditions.map(c => (
                <button
                  key={c}
                  className={`condition-chip ${conditions.includes(c) ? 'condition-active' : ''}`}
                  onClick={() => toggleCondition(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional: Menstrual */}
          {gender === 'Female' && (
            <div className="detail-field menstrual-field" style={{ marginTop: 16 }}>
              <label>🩸 Menstrual Cycle Status</label>
              <div className="gender-btns">
                {['Regular', 'Irregular', 'Missed', 'Not Applicable'].map(m => (
                  <button
                    key={m}
                    className={`gender-btn ${menstrualInfo === m ? 'gender-active' : ''}`}
                    onClick={() => setMenstrualInfo(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ═════════════ SECTION 2: SYMPTOM SELECTION ═════════════ */}
        <div className="triage-section" id="symptom-selection-section">
          <div className="section-label">
            <Activity size={18} />
            <span>Select Your Symptoms</span>
            {selectedSymptoms.length > 0 && (
              <span className="symptom-count">{selectedSymptoms.length} selected</span>
            )}
          </div>

          {/* Category Tabs */}
          <div className="category-tabs">
            {symptomCategories.map(cat => (
              <button
                key={cat.id}
                className={`category-tab ${activeCategory === cat.id ? 'cat-active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
                style={activeCategory === cat.id ? { borderColor: cat.color, color: cat.color } : {}}
              >
                <cat.icon size={16} />
                <span>{cat.title}</span>
              </button>
            ))}
          </div>

          {/* Symptoms Grid */}
          {activeCat && (
            <div className={`symptoms-card ${activeCat.id === 'critical' ? 'symptoms-critical' : ''}`}>
              {activeCat.id === 'critical' && (
                <div className="critical-warning">
                  <AlertTriangle size={16} />
                  <span>If you're experiencing any of these, seek immediate medical help!</span>
                </div>
              )}
              <div className="symptoms-grid">
                {activeCat.symptoms.map((sym, i) => {
                  const isSelected = selectedSymptoms.includes(sym.name)
                  const sevClass = sym.severity === 'critical' ? 'sym-critical' :
                    sym.severity === 'moderate' ? 'sym-moderate' : 'sym-mild'
                  return (
                    <button
                      key={i}
                      className={`symptom-btn ${sevClass} ${isSelected ? 'sym-selected' : ''}`}
                      onClick={() => toggleSymptom(sym.name)}
                      id={`symptom-${sym.name.replace(/\s/g, '-').toLowerCase()}`}
                    >
                      <span className="sym-indicator" />
                      <span>{sym.name}</span>
                      {isSelected && <span className="sym-check">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Selected Summary */}
          {selectedSymptoms.length > 0 && (
            <div className="selected-symptoms-bar">
              <span className="text-xs text-muted font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selected:</span>
              <div className="selected-symptom-tags">
                {selectedSymptoms.map((s, i) => {
                  let color = '#10b981'
                  for (const cat of symptomCategories) {
                    const found = cat.symptoms.find(sym => sym.name === s)
                    if (found) {
                      color = found.severity === 'critical' ? '#ef4444' : found.severity === 'moderate' ? '#f97316' : '#10b981'
                      break
                    }
                  }
                  return (
                    <span key={i} className="selected-tag" style={{ borderColor: `${color}60`, background: `${color}15`, color }}>
                      {s}
                      <button onClick={() => toggleSymptom(s)} className="tag-remove">×</button>
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ═════════════ SECTION 3: CUSTOM SYMPTOM ═════════════ */}
        <div className="triage-section" id="custom-symptom-section">
          <div className="section-label">
            <Plus size={18} />
            <span>Can't find your symptom? Add here</span>
          </div>
          <div className="custom-input-row">
            <div className="custom-input-wrap">
              <Search size={16} className="custom-search-icon" />
              <input
                className="custom-input"
                placeholder="Type your symptom..."
                value={customSymptom}
                onChange={e => setCustomSymptom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomSymptom()}
                id="custom-symptom-input"
              />
            </div>
            <button className={`voice-btn ${isListening ? 'voice-active' : ''}`} onClick={handleVoice} id="voice-btn">
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={addCustomSymptom} disabled={!customSymptom.trim()}>
              <Plus size={16} /> Add
            </button>
          </div>
          {isListening && (
            <div className="voice-status">
              <div className="voice-waves">
                <span /><span /><span /><span /><span />
              </div>
              <span className="text-sm">Listening... speak your symptom</span>
            </div>
          )}
        </div>

        {/* ═════════════ SECTION 4: CONTEXT ═════════════ */}
        <div className="triage-section" id="context-section">
          <div className="section-label">
            <Brain size={18} />
            <span>Additional Context</span>
          </div>

          <div className="context-grid">
            {/* Duration */}
            <div className="detail-field">
              <label>How long have you had these symptoms?</label>
              <div className="duration-btns">
                {durationOptions.map(d => (
                  <button
                    key={d}
                    className={`duration-btn ${duration === d ? 'dur-active' : ''}`}
                    onClick={() => setDuration(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Slider */}
            <div className="detail-field">
              <label>
                Severity Level:
                <span className="severity-badge" style={{ color: severityInfo.color, background: `${severityInfo.color}15`, borderColor: `${severityInfo.color}40` }}>
                  {severity}/10 — {severityInfo.text}
                </span>
              </label>
              <div className="severity-slider-wrap">
                <span className="slider-label-left">Mild</span>
                <input
                  type="range"
                  min="1" max="10"
                  value={severity}
                  onChange={e => setSeverity(parseInt(e.target.value))}
                  className="severity-slider"
                  style={{
                    '--slider-pct': `${(severity - 1) / 9 * 100}%`,
                    '--slider-color': severityInfo.color,
                  }}
                  id="severity-slider"
                />
                <span className="slider-label-right">Severe</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═════════════ CRITICAL ALERT ═════════════ */}
        {hasCritical && (
          <div className="critical-alert" id="critical-alert">
            <AlertTriangle size={20} />
            <div>
              <strong>Critical symptoms detected!</strong>
              <p>Based on your selection, this may require immediate medical attention. If this is an emergency, please call 112 now.</p>
            </div>
          </div>
        )}

        {/* Spacer for sticky button */}
        <div style={{ height: 100 }} />

        {/* ═════════════ STICKY CTA ═════════════ */}
        <div className="sticky-cta" id="analyze-cta">
          <div className="cta-inner">
            <div className="cta-summary">
              <span className="text-sm">
                {selectedSymptoms.length > 0
                  ? `${selectedSymptoms.length} symptom${selectedSymptoms.length > 1 ? 's' : ''} selected`
                  : 'Select symptoms to continue'}
              </span>
              {canSubmit && (
                <span className="text-xs text-muted">Age: {age} • {gender} • {duration}</span>
              )}
            </div>
            <button
              className={`btn btn-primary btn-lg analyze-btn ${isAnalyzing ? 'analyzing' : ''}`}
              disabled={!canSubmit || isAnalyzing}
              onClick={handleAnalyze}
              id="analyze-btn"
            >
              {isAnalyzing ? (
                <>
                  <div className="analyze-spinner" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain size={20} />
                  Analyze with AI
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Analyzing Overlay */}
      {isAnalyzing && (
        <div className="analyzing-overlay" id="analyzing-overlay">
          <div className="analyzing-content">
            <div className="analyzing-ring" />
            <h2 className="text-2xl font-bold">Analyzing Symptoms...</h2>
            <p className="text-muted">Our AI is processing {selectedSymptoms.length} indicators</p>
            <div className="analyzing-steps">
              <div className="a-step a-step-done"><span className="a-dot" /> Processing symptoms</div>
              <div className="a-step a-step-active"><span className="a-dot" /> Generating risk score</div>
              <div className="a-step"><span className="a-dot" /> Matching specialists</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
