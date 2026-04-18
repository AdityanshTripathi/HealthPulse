import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  Activity, Brain, Shield, Clock, Map, Video, Phone, 
  Heart, Stethoscope, ArrowRight, ChevronRight, Star, 
  Users, Building2, Zap, Globe, Sparkles, CheckCircle2,
  MessageCircle, Mic
} from 'lucide-react'
import './Landing.css'

const stats = [
  { number: '2M+', label: 'Lives Analyzed', icon: Heart },
  { number: '500+', label: 'Verified Doctors', icon: Stethoscope },
  { number: '1200+', label: 'Partner Hospitals', icon: Building2 },
  { number: '< 30s', label: 'Avg Triage Time', icon: Clock },
]

const features = [
  {
    icon: Brain,
    title: 'AI Symptom Analysis',
    desc: 'Advanced NLP engine processes your symptoms in real-time, providing medical-grade triage classification.',
    color: '#0C2924',
  },
  {
    icon: Shield,
    title: 'Risk Score Engine',
    desc: 'Proprietary scoring algorithm rates urgency 0-100, classifying conditions as Emergency, Urgent, or Routine.',
    color: '#2563eb',
  },
  {
    icon: Stethoscope,
    title: 'Smart Doctor Match',
    desc: 'Automatically maps your condition to the right specialist, with availability and ratings.',
    color: '#06b6d4',
  },
  {
    icon: Map,
    title: 'Hospital Discovery',
    desc: 'Real-time GPS-based nearby hospital finder with ER availability, ratings, and navigation.',
    color: '#10b981',
  },
  {
    icon: Video,
    title: 'Video Consultation',
    desc: 'Instant video calls with matched doctors. No waiting rooms, no delays.',
    color: '#f59e0b',
  },
  {
    icon: Phone,
    title: 'Emergency SOS',
    desc: 'One-tap ambulance dispatch with live location sharing and nearest ER routing.',
    color: '#ef4444',
  },
]

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Saved during cardiac event',
    text: 'HealthPulse identified my symptoms as cardiac emergency when I thought it was just acidity. The ambulance was there in 8 minutes.',
    rating: 5,
    avatar: '👩‍💼',
  },
  {
    name: 'Rajesh Kumar',
    role: 'Rural village, Bihar',
    text: 'No doctor within 40km. HealthPulse connected me to a specialist via video call within minutes. Life-changing.',
    rating: 5,
    avatar: '👨‍🌾',
  },
  {
    name: 'Dr. Anita Patel',
    role: 'Cardiologist, Mumbai',
    text: 'As a doctor, I recommend HealthPulse to all my patients. The AI triage is remarkably accurate and saves precious decision time.',
    rating: 5,
    avatar: '👩‍⚕️',
  },
]

const usps = [
  'AI processes symptoms in 30 seconds',
  'Covers 500+ medical conditions',
  'Available in 12 Indian languages',
  'HIPAA & DISHA compliant',
  'Real-time ambulance tracking',
  'Free for emergency triage',
]

function AnimatedNumber({ target, suffix = '' }) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setIsVisible(true) },
      { threshold: 0.3 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return
    const num = parseInt(target.replace(/[^0-9]/g, ''))
    if (isNaN(num)) return
    const dur = 2000
    const steps = 60
    const inc = num / steps
    let current = 0
    const timer = setInterval(() => {
      current += inc
      if (current >= num) { setValue(num); clearInterval(timer); return }
      setValue(Math.floor(current))
    }, dur / steps)
    return () => clearInterval(timer)
  }, [isVisible, target])

  const num = parseInt(target.replace(/[^0-9]/g, ''))
  const prefix = target.replace(/[0-9]/g, '').replace('+', '')
  const hasSuffix = target.includes('+')

  return (
    <span ref={ref}>
      {prefix}{isNaN(num) ? target : value}{hasSuffix ? '+' : ''}{suffix}
    </span>
  )
}

export default function Landing({ onAuthClick, session }) {
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="landing page-enter">

      {/* ──── Hero ──── */}
      <section className="hero" id="hero-section">
        <div className="hero-bg">
          <div className="orb" style={{ width: 500, height: 500, background: 'rgba(124,58,237,0.15)', top: '-10%', left: '-10%' }} />
          <div className="orb" style={{ width: 400, height: 400, background: 'rgba(37,99,235,0.12)', bottom: '-5%', right: '-5%', animationDelay: '3s' }} />
          <div className="orb" style={{ width: 300, height: 300, background: 'rgba(6,182,212,0.1)', top: '50%', left: '60%', animationDelay: '5s' }} />
          <div className="hero-grid-lines" />
        </div>

        <div className="container hero-content">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>Powered by Advanced AI</span>
            <span className="badge-dot" />
            <span>HackNova 1.0</span>
          </div>

          <h1 className="hero-title">
            Your Health Decisions,<br />
            <span className="gradient-text-hero">Powered by AI.</span>
          </h1>

          <p className="hero-subtitle">
            Describe your symptoms in seconds. Our AI triage engine analyzes, scores risk, 
            and connects you to the right doctor — instantly. <strong>Every second counts.</strong>
          </p>

          <div className="hero-actions">
            {session ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg" id="start-triage-btn">
                <Activity size={20} />
                Go to Dashboard
                <ArrowRight size={18} />
              </Link>
            ) : (
              <button onClick={() => onAuthClick('signup')} className="btn btn-primary btn-lg" id="start-triage-btn" style={{ border: 'none', cursor: 'pointer' }}>
                <Activity size={20} />
                Get Started
                <ArrowRight size={18} />
              </button>
            )}
            <Link to="/emergency" className="btn btn-danger btn-lg" id="emergency-hero-btn">
              <Phone size={20} />
              Emergency SOS
            </Link>
          </div>

          <div className="hero-trust">
            {usps.map((u, i) => (
              <div key={i} className="trust-item">
                <CheckCircle2 size={14} />
                <span>{u}</span>
              </div>
            ))}
          </div>

          {/* Hero Demo Card */}
          <div className="hero-demo-card glass" id="hero-demo">
            <div className="demo-header">
              <div className="demo-dot" />
              <span>Live AI Triage Demo</span>
            </div>
            <div className="demo-chat">
              <div className="demo-msg demo-user">
                <MessageCircle size={14} />
                <span>I have severe chest pain and shortness of breath since this morning</span>
              </div>
              <div className="demo-msg demo-ai">
                <Brain size={14} />
                <div>
                  <span className="demo-ai-label">HealthPulse AI</span>
                  <span>Analyzing symptoms... <strong>Potential cardiac event detected.</strong></span>
                  <div className="demo-result">
                    <span className="badge badge-emergency">🔴 EMERGENCY</span>
                    <span className="demo-score">Risk Score: <strong>92/100</strong></span>
                  </div>
                  <span className="demo-action">→ Cardiologist recommended • Nearest ER: 2.3km</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Stats ──── */}
      <section className="stats-bar" id="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div key={i} className="stat-item">
                <s.icon size={24} className="stat-icon" />
                <div className="stat-number">
                  <AnimatedNumber target={s.number} />
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── Features ──── */}
      <section className="features-section section" id="features-section">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-purple">
              <Zap size={12} />
              Core Features
            </span>
            <h2 className="text-4xl font-bold">
              Everything You Need,<br />
              <span className="gradient-text">In One Platform</span>
            </h2>
            <p className="text-muted text-lg" style={{ maxWidth: 560, margin: '0 auto' }}>
              From symptom analysis to ambulance dispatch — HealthPulse covers the complete healthcare journey.
            </p>
          </div>

          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card card card-glow" style={{ '--accent': f.color, animationDelay: `${i * 0.1}s` }}>
                <div className="feature-icon" style={{ background: `${f.color}20` }}>
                  <f.icon size={24} style={{ color: f.color }} />
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc text-muted">{f.desc}</p>
                <div className="feature-link">
                  Learn more <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── How It Works ──── */}
      <section className="how-section section" id="how-section">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-purple">
              <Activity size={12} />
              How It Works
            </span>
            <h2 className="text-4xl font-bold">
              Three Steps to<br />
              <span className="gradient-text">Save Your Life</span>
            </h2>
          </div>

          <div className="how-steps">
            <div className="how-step">
              <div className="step-number">01</div>
              <div className="step-icon-wrap">
                <Mic size={32} />
              </div>
              <h3>Describe Symptoms</h3>
              <p className="text-muted">Type or speak your symptoms. Our AI understands natural language in 12+ Indian languages.</p>
            </div>
            <div className="step-connector">
              <ArrowRight size={24} />
            </div>
            <div className="how-step">
              <div className="step-number">02</div>
              <div className="step-icon-wrap">
                <Brain size={32} />
              </div>
              <h3>AI Analyzes & Scores</h3>
              <p className="text-muted">Our triage engine generates a risk score and classifies urgency in under 30 seconds.</p>
            </div>
            <div className="step-connector">
              <ArrowRight size={24} />
            </div>
            <div className="how-step">
              <div className="step-number">03</div>
              <div className="step-icon-wrap">
                <Stethoscope size={32} />
              </div>
              <h3>Take Action</h3>
              <p className="text-muted">Book a doctor, start a video consult, or dispatch an ambulance — all from one screen.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Testimonials ──── */}
      <section className="testimonials-section section" id="testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-purple">
              <Star size={12} />
              Stories That Matter
            </span>
            <h2 className="text-4xl font-bold">
              Real People,<br />
              <span className="gradient-text">Real Impact</span>
            </h2>
          </div>

          <div className="testimonials-carousel">
            {testimonials.map((t, i) => (
              <div key={i} className={`testimonial-card card ${i === activeTestimonial ? 'testimonial-active' : ''}`}>
                <div className="testimonial-stars">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={16} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <span className="testimonial-avatar">{t.avatar}</span>
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-muted">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="testimonial-dots">
            {testimonials.map((_, i) => (
              <button key={i} className={`dot ${i === activeTestimonial ? 'dot-active' : ''}`} onClick={() => setActiveTestimonial(i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ──── CTA ──── */}
      <section className="cta-section section" id="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-glow" />
            <div className="cta-content">
              <h2 className="text-4xl font-bold">
                Don't Wait.<br />
                <span className="gradient-text-hero">Every Second Counts.</span>
              </h2>
              <p className="text-muted text-lg" style={{ maxWidth: 500 }}>
                68% of medical emergencies in India face delayed treatment due to wrong decisions. 
                HealthPulse changes that — starting now.
              </p>
              <div className="hero-actions" style={{ justifyContent: 'center' }}>
                {session ? (
                  <Link to="/dashboard" className="btn btn-primary btn-lg">
                    <Activity size={20} />
                    Go to Dashboard
                    <ArrowRight size={18} />
                  </Link>
                ) : (
                  <button onClick={() => onAuthClick('signup')} className="btn btn-primary btn-lg" style={{ border: 'none', cursor: 'pointer' }}>
                    <Activity size={20} />
                    Get Started Now
                    <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Footer ──── */}
      <footer className="footer" id="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="navbar-logo" style={{ marginBottom: 12 }}>
                <div className="navbar-logo-icon"><Activity size={18} color="#fff" /></div>
                <span>Health<span className="gradient-text">Pulse</span></span>
              </div>
              <p className="text-sm text-muted">India's first AI-powered healthcare triage platform. Making life-saving decisions accessible to everyone.</p>
            </div>
            <div className="footer-links">
              <h4>Platform</h4>
              <a href="/triage">Symptom Check</a>
              <a href="/doctors">Find Doctors</a>
              <a href="/hospitals">Hospitals</a>
              <a href="/emergency">Emergency</a>
            </div>
            <div className="footer-links">
              <h4>Resources</h4>
              <a href="#">Health Blog</a>
              <a href="#">API Docs</a>
              <a href="#">Research Papers</a>
              <a href="#">Partner Program</a>
            </div>
            <div className="footer-links">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="text-sm text-muted">© 2026 HealthPulse. Built with ❤️ for India. <span className="badge badge-purple" style={{ marginLeft: 8 }}>HackNova 1.0</span></p>
            <div className="footer-langs">
              <Globe size={14} />
              <span className="text-sm text-muted">EN · हि · বা · తె · மி · ಕ · മ · gu · ਪੰ · मरा · or · اردو</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
