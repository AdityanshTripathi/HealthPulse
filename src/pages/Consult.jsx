import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Video, VideoOff, Mic, MicOff, Phone, Monitor,
  MessageSquare, MoreVertical, Clock, FileText,
  Send, Maximize, Sparkles, Shield
} from 'lucide-react'
import './Consult.css'

export default function Consult() {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [callState, setCallState] = useState('waiting') // waiting | connecting | active | ended
  const [elapsed, setElapsed] = useState(0)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState([
    { from: 'doctor', text: 'Hello! I can see your triage report. Let me review your symptoms.', time: '2:31 PM' },
  ])

  useEffect(() => {
    if (callState === 'waiting') {
      const t = setTimeout(() => setCallState('connecting'), 2000)
      return () => clearTimeout(t)
    }
    if (callState === 'connecting') {
      const t = setTimeout(() => setCallState('active'), 3000)
      return () => clearTimeout(t)
    }
  }, [callState])

  useEffect(() => {
    if (callState !== 'active') return
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [callState])

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const sendChat = () => {
    if (!chatInput.trim()) return
    setMessages(prev => [...prev, { from: 'user', text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    setChatInput('')
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'doctor', text: 'I understand. Let me check that for you.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    }, 2000)
  }

  const endCall = () => {
    setCallState('ended')
  }

  return (
    <div className="consult-page page-enter">
      {callState === 'ended' ? (
        <div className="call-ended-screen">
          <div className="ended-content">
            <div className="ended-icon">
              <Shield size={48} />
            </div>
            <h2 className="text-2xl font-bold">Consultation Complete</h2>
            <p className="text-muted">Duration: {formatTime(elapsed)}</p>
            <div className="ended-summary card" style={{ background: 'var(--bg-surface)' }}>
              <h4 className="flex items-center gap-2"><FileText size={16} /> Consultation Summary</h4>
              <div className="summary-items">
                <div className="summary-item">
                  <span className="text-muted">Doctor</span>
                  <span>Dr. Rajesh Menon</span>
                </div>
                <div className="summary-item">
                  <span className="text-muted">Diagnosis</span>
                  <span>Preliminary cardiac assessment</span>
                </div>
                <div className="summary-item">
                  <span className="text-muted">Prescription</span>
                  <span className="badge badge-routine">Generated</span>
                </div>
                <div className="summary-item">
                  <span className="text-muted">Follow-up</span>
                  <span>Recommended in 7 days</span>
                </div>
              </div>
            </div>
            <div className="ended-actions">
              <Link to="/dashboard" className="btn btn-primary btn-lg">View in Dashboard</Link>
              <Link to="/" className="btn btn-secondary btn-lg">Back to Home</Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="call-screen">
          {/* Main Video */}
          <div className="video-main" id="video-main">
            <div className="video-feed-doctor">
              <div className="doctor-video-placeholder">
                <span className="doc-avatar-large">👨‍⚕️</span>
                <span className="doc-name-overlay">Dr. Rajesh Menon</span>
                <span className="doc-specialty-overlay">Cardiologist</span>
              </div>
              {callState === 'waiting' && (
                <div className="call-overlay">
                  <div className="loader-ring" />
                  <span>Waiting for doctor to join...</span>
                </div>
              )}
              {callState === 'connecting' && (
                <div className="call-overlay">
                  <div className="loader-ring" />
                  <span>Connecting...</span>
                </div>
              )}
            </div>

            {/* Self view */}
            <div className="video-self">
              {isVideoOn ? (
                <div className="self-placeholder">
                  <span>You</span>
                </div>
              ) : (
                <div className="self-placeholder self-off">
                  <VideoOff size={20} />
                </div>
              )}
            </div>

            {/* Call Info Bar */}
            <div className="call-info-bar glass">
              <div className="call-status">
                {callState === 'active' && <span className="status-dot" />}
                <span className="text-sm">
                  {callState === 'active' ? `In Call • ${formatTime(elapsed)}` : 
                   callState === 'connecting' ? 'Connecting...' : 'Waiting...'}
                </span>
              </div>
              <div className="call-quality">
                <span className="badge badge-routine text-xs">HD</span>
                <span className="badge badge-purple text-xs">
                  <Shield size={10} /> Encrypted
                </span>
              </div>
            </div>

            {/* AI Insights Panel */}
            {callState === 'active' && (
              <div className="ai-insights glass" id="ai-insights">
                <div className="insights-header">
                  <Sparkles size={14} className="text-purple" />
                  <span className="text-xs font-semibold">AI Live Insights</span>
                </div>
                <div className="insights-content">
                  <div className="insight-item">
                    <span className="text-xs text-muted">Triage Score</span>
                    <span className="text-sm font-bold text-purple">78/100</span>
                  </div>
                  <div className="insight-item">
                    <span className="text-xs text-muted">Classification</span>
                    <span className="badge badge-urgent" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>URGENT</span>
                  </div>
                  <div className="insight-item">
                    <span className="text-xs text-muted">Symptoms</span>
                    <span className="text-xs">Chest pain, breathing difficulty</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="call-controls glass">
            <button className={`control-btn ${isMuted ? 'control-off' : ''}`} onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>
            <button className={`control-btn ${!isVideoOn ? 'control-off' : ''}`} onClick={() => setIsVideoOn(!isVideoOn)}>
              {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
              <span>{isVideoOn ? 'Stop Video' : 'Start Video'}</span>
            </button>
            <button className="control-btn" onClick={() => setChatOpen(!chatOpen)}>
              <MessageSquare size={20} />
              <span>Chat</span>
            </button>
            <button className="control-btn">
              <Monitor size={20} />
              <span>Share</span>
            </button>
            <button className="control-btn control-end" onClick={endCall} id="end-call-btn">
              <Phone size={20} />
              <span>End</span>
            </button>
          </div>

          {/* Chat Sidebar */}
          {chatOpen && (
            <div className="chat-sidebar glass" id="consult-chat">
              <div className="chat-side-header">
                <h4>In-Call Chat</h4>
                <button className="control-btn-mini" onClick={() => setChatOpen(false)}>×</button>
              </div>
              <div className="chat-side-messages">
                {messages.map((msg, i) => (
                  <div key={i} className={`side-msg ${msg.from === 'user' ? 'side-msg-user' : 'side-msg-doc'}`}>
                    <span className="side-msg-text">{msg.text}</span>
                    <span className="side-msg-time">{msg.time}</span>
                  </div>
                ))}
              </div>
              <div className="chat-side-input">
                <input
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                />
                <button onClick={sendChat}><Send size={16} /></button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
