import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar, Clock, CheckCircle2, Star, MapPin, Video,
  ArrowRight, ChevronLeft, ChevronRight, Sparkles, CreditCard
} from 'lucide-react'
import './Appointment.css'

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
]

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function Appointment() {
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState(16)
  const [selectedTime, setSelectedTime] = useState(null)
  const [consultType, setConsultType] = useState('in-person')
  const [month] = useState(3) // April
  const [year] = useState(2026)

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const today = 16

  const handleBook = () => {
    setStep(3)
  }

  return (
    <div className="appointment-page page-enter">
      <div className="container">
        <div className="appointment-header">
          <span className="badge badge-purple"><Sparkles size={12} /> Smart Booking</span>
          <h1 className="text-3xl font-bold" style={{ marginTop: 12 }}>Book Appointment</h1>
          <p className="text-muted">Schedule a consultation with your matched specialist</p>
        </div>

        {/* Progress */}
        <div className="booking-progress">
          <div className={`progress-step ${step >= 1 ? 'step-active' : ''}`}>
            <span className="step-circle">1</span>
            <span>Select Date & Time</span>
          </div>
          <div className="progress-line" style={{ background: step >= 2 ? 'var(--purple)' : 'var(--border-subtle)' }} />
          <div className={`progress-step ${step >= 2 ? 'step-active' : ''}`}>
            <span className="step-circle">2</span>
            <span>Confirm Details</span>
          </div>
          <div className="progress-line" style={{ background: step >= 3 ? 'var(--purple)' : 'var(--border-subtle)' }} />
          <div className={`progress-step ${step >= 3 ? 'step-active' : ''}`}>
            <span className="step-circle">3</span>
            <span>Booked!</span>
          </div>
        </div>

        <div className="appointment-layout">
          {/* Doctor Card (sidebar) */}
          <div className="appt-doctor-card card">
            <div className="appt-doc-avatar">👨‍⚕️</div>
            <h3>Dr. Rajesh Menon</h3>
            <span className="text-sm text-purple">Cardiologist</span>
            <div className="appt-doc-rating">
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <span>4.9</span>
              <span className="text-xs text-muted">(342 reviews)</span>
            </div>
            <div className="divider" />
            <div className="appt-doc-meta">
              <span><MapPin size={14} /> Apollo Hospital, Mumbai</span>
              <span><Clock size={14} /> 15 years experience</span>
              <span><CreditCard size={14} /> ₹800 per consultation</span>
            </div>

            <div className="consult-type-picker">
              <button
                className={`type-btn ${consultType === 'in-person' ? 'type-active' : ''}`}
                onClick={() => setConsultType('in-person')}
              >
                <MapPin size={14} />
                In-Person
              </button>
              <button
                className={`type-btn ${consultType === 'video' ? 'type-active' : ''}`}
                onClick={() => setConsultType('video')}
              >
                <Video size={14} />
                Video Call
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="appt-main">
            {step === 1 && (
              <div className="step-content">
                {/* Calendar */}
                <div className="calendar-card card" id="appointment-calendar">
                  <div className="calendar-header">
                    <button className="cal-nav"><ChevronLeft size={18} /></button>
                    <h3>{months[month]} {year}</h3>
                    <button className="cal-nav"><ChevronRight size={18} /></button>
                  </div>
                  <div className="calendar-grid">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <span key={d} className="cal-day-header">{d}</span>
                    ))}
                    {[...Array(firstDay)].map((_, i) => <span key={`e${i}`} />)}
                    {[...Array(daysInMonth)].map((_, i) => {
                      const day = i + 1
                      const isPast = day < today
                      const isSelected = day === selectedDate
                      const isToday = day === today
                      return (
                        <button
                          key={day}
                          className={`cal-day ${isPast ? 'cal-past' : ''} ${isSelected ? 'cal-selected' : ''} ${isToday ? 'cal-today' : ''}`}
                          disabled={isPast}
                          onClick={() => setSelectedDate(day)}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                <div className="timeslots-card card" id="time-slots">
                  <h3 className="flex items-center gap-2">
                    <Clock size={16} className="text-purple" />
                    Available Slots — April {selectedDate}
                  </h3>
                  <div className="slots-grid">
                    {timeSlots.map((slot, i) => (
                      <button
                        key={i}
                        className={`slot-btn ${selectedTime === slot ? 'slot-selected' : ''} ${[2, 5, 8].includes(i) ? 'slot-unavailable' : ''}`}
                        onClick={() => ![2, 5, 8].includes(i) && setSelectedTime(slot)}
                        disabled={[2, 5, 8].includes(i)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  <button
                    className="btn btn-primary btn-lg w-full"
                    disabled={!selectedTime}
                    onClick={() => setStep(2)}
                    style={{ marginTop: 16 }}
                  >
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="confirm-card card" id="booking-confirm">
                <h3 className="text-xl font-bold">Confirm Your Appointment</h3>
                <div className="confirm-details">
                  <div className="confirm-row">
                    <span className="text-muted">Doctor</span>
                    <span className="font-semibold">Dr. Rajesh Menon</span>
                  </div>
                  <div className="confirm-row">
                    <span className="text-muted">Specialty</span>
                    <span>Cardiologist</span>
                  </div>
                  <div className="confirm-row">
                    <span className="text-muted">Date</span>
                    <span>April {selectedDate}, 2026</span>
                  </div>
                  <div className="confirm-row">
                    <span className="text-muted">Time</span>
                    <span className="font-semibold text-purple">{selectedTime}</span>
                  </div>
                  <div className="confirm-row">
                    <span className="text-muted">Type</span>
                    <span>{consultType === 'video' ? '📹 Video Consultation' : '🏥 In-Person Visit'}</span>
                  </div>
                  <div className="confirm-row">
                    <span className="text-muted">Hospital</span>
                    <span>Apollo Hospital, Mumbai</span>
                  </div>
                  <div className="confirm-row total-row">
                    <span className="font-semibold">Consultation Fee</span>
                    <span className="text-xl font-bold gradient-text">₹800</span>
                  </div>
                </div>
                <div className="confirm-actions">
                  <button className="btn btn-secondary" onClick={() => setStep(1)}>
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button className="btn btn-primary btn-lg" onClick={handleBook} style={{ flex: 1 }}>
                    <CheckCircle2 size={18} /> Confirm & Book
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="success-card card" id="booking-success">
                <div className="success-icon">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-2xl font-bold">Appointment Booked! 🎉</h2>
                <p className="text-muted">
                  Your {consultType === 'video' ? 'video consultation' : 'appointment'} with Dr. Rajesh Menon 
                  has been confirmed for April {selectedDate}, 2026 at {selectedTime}.
                </p>
                <div className="success-details card" style={{ background: 'var(--bg-surface)' }}>
                  <div className="confirm-row">
                    <span className="text-muted">Booking ID</span>
                    <span className="font-semibold">#MT-2026-{Math.floor(Math.random() * 9000 + 1000)}</span>
                  </div>
                  <div className="confirm-row">
                    <span className="text-muted">Status</span>
                    <span className="badge badge-routine">Confirmed</span>
                  </div>
                </div>
                <div className="success-actions">
                  <Link to="/dashboard" className="btn btn-primary btn-lg">
                    View in Dashboard
                  </Link>
                  <Link to="/" className="btn btn-secondary btn-lg">
                    Back to Home
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
