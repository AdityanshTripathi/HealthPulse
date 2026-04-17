import { useState } from 'react'
import {
  Activity, Heart, Calendar, TrendingUp, Clock, FileText,
  Pill, AlertTriangle, CheckCircle2, ArrowUpRight, ArrowDownRight,
  Sparkles, BarChart3, Droplets, Thermometer, Wind
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts'
import './Dashboard.css'

const vitalData = [
  { date: 'Mon', heartRate: 72, bp: 120, spo2: 97, temp: 98.2 },
  { date: 'Tue', heartRate: 75, bp: 118, spo2: 98, temp: 98.4 },
  { date: 'Wed', heartRate: 68, bp: 122, spo2: 97, temp: 98.1 },
  { date: 'Thu', heartRate: 80, bp: 130, spo2: 96, temp: 99.1 },
  { date: 'Fri', heartRate: 73, bp: 119, spo2: 98, temp: 98.3 },
  { date: 'Sat', heartRate: 71, bp: 117, spo2: 99, temp: 98.0 },
  { date: 'Sun', heartRate: 69, bp: 120, spo2: 98, temp: 98.2 },
]

const triageHistory = [
  {
    date: '2026-04-16', time: '2:30 PM', symptoms: ['Chest pain', 'Shortness of breath'],
    riskScore: 78, classification: 'urgent', doctor: 'Dr. Rajesh Menon',
    status: 'Consultation completed',
  },
  {
    date: '2026-04-10', time: '10:15 AM', symptoms: ['Headache', 'Dizziness'],
    riskScore: 42, classification: 'routine', doctor: 'Dr. Priya Nair',
    status: 'Prescription given',
  },
  {
    date: '2026-03-28', time: '8:45 PM', symptoms: ['High fever', 'Body ache', 'Cough'],
    riskScore: 55, classification: 'urgent', doctor: 'Dr. Arun Sharma',
    status: 'Follow-up scheduled',
  },
  {
    date: '2026-03-15', time: '4:00 PM', symptoms: ['Joint pain'],
    riskScore: 25, classification: 'routine', doctor: 'Dr. Vikram Singh',
    status: 'Medication prescribed',
  },
]

const medications = [
  { name: 'Aspirin 75mg', schedule: 'Morning, after food', remaining: 12, icon: '💊' },
  { name: 'Metformin 500mg', schedule: 'Twice daily', remaining: 24, icon: '💊' },
  { name: 'Vitamin D3', schedule: 'Weekly, Sunday', remaining: 8, icon: '☀️' },
]

const vitalCards = [
  { label: 'Heart Rate', value: '72', unit: 'bpm', icon: Heart, color: '#ef4444', trend: 'down', trendVal: '3%' },
  { label: 'Blood Pressure', value: '120/80', unit: 'mmHg', icon: Activity, color: '#7c3aed', trend: 'stable', trendVal: '0%' },
  { label: 'SpO2', value: '98', unit: '%', icon: Droplets, color: '#2563eb', trend: 'up', trendVal: '1%' },
  { label: 'Temperature', value: '98.2', unit: '°F', icon: Thermometer, color: '#10b981', trend: 'stable', trendVal: '0%' },
]

export default function Dashboard() {
  const [activeChart, setActiveChart] = useState('heartRate')

  const chartConfig = {
    heartRate: { key: 'heartRate', color: '#ef4444', label: 'Heart Rate (bpm)' },
    bp: { key: 'bp', color: '#7c3aed', label: 'Blood Pressure (systolic)' },
    spo2: { key: 'spo2', color: '#2563eb', label: 'SpO2 (%)' },
    temp: { key: 'temp', color: '#10b981', label: 'Temperature (°F)' },
  }

  const config = chartConfig[activeChart]

  return (
    <div className="dashboard-page page-enter">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <span className="badge badge-purple"><Sparkles size={12} /> Health Intelligence</span>
            <h1 className="text-3xl font-bold" style={{ marginTop: 12 }}>My Health Dashboard</h1>
            <p className="text-muted">Track your health journey, vitals, and medical timeline</p>
          </div>
          <div className="header-user">
            <div className="user-avatar">AK</div>
            <div>
              <span className="font-semibold">Aditya Kumar</span>
              <span className="text-sm text-muted">Premium Member</span>
            </div>
          </div>
        </div>

        {/* Vitals Cards */}
        <div className="vitals-grid">
          {vitalCards.map((v, i) => (
            <div key={i} className="vital-card card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="vital-header">
                <div className="vital-icon" style={{ background: `${v.color}20` }}>
                  <v.icon size={18} style={{ color: v.color }} />
                </div>
                <span className="vital-trend" style={{ color: v.trend === 'down' ? '#10b981' : v.trend === 'up' ? '#ef4444' : 'var(--text-muted)' }}>
                  {v.trend === 'down' ? <ArrowDownRight size={14} /> : v.trend === 'up' ? <ArrowUpRight size={14} /> : null}
                  {v.trendVal}
                </span>
              </div>
              <div className="vital-value" style={{ color: v.color }}>
                {v.value}
                <span className="vital-unit">{v.unit}</span>
              </div>
              <span className="text-xs text-muted">{v.label}</span>
            </div>
          ))}
        </div>

        {/* Chart & Timeline */}
        <div className="dashboard-grid">
          {/* Vitals Chart */}
          <div className="chart-card card" id="vitals-chart">
            <div className="chart-header">
              <h3 className="flex items-center gap-2">
                <BarChart3 size={18} className="text-purple" />
                Vitals Trend
              </h3>
              <div className="chart-tabs">
                {Object.entries(chartConfig).map(([key, c]) => (
                  <button
                    key={key}
                    className={`chart-tab ${activeChart === key ? 'chart-tab-active' : ''}`}
                    onClick={() => setActiveChart(key)}
                    style={activeChart === key ? { borderColor: c.color, color: c.color } : {}}
                  >
                    {c.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-area">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={vitalData}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card-solid)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      color: 'var(--text-primary)',
                      fontSize: 13,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={config.key}
                    stroke={config.color}
                    strokeWidth={2}
                    fill="url(#chartGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Health Timeline */}
          <div className="timeline-card card" id="health-timeline">
            <h3 className="flex items-center gap-2">
              <Clock size={18} className="text-purple" />
              Health Timeline
            </h3>
            <div className="timeline">
              {triageHistory.map((entry, i) => (
                <div key={i} className="timeline-item" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="timeline-dot-wrap">
                    <div className={`timeline-dot timeline-dot-${entry.classification}`} />
                    {i < triageHistory.length - 1 && <div className="timeline-line" />}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-date">
                      <Calendar size={12} />
                      {entry.date} • {entry.time}
                    </div>
                    <div className="timeline-symptoms">
                      {entry.symptoms.map((s, j) => (
                        <span key={j} className="badge badge-purple">{s}</span>
                      ))}
                    </div>
                    <div className="timeline-meta">
                      <span className={`badge badge-${entry.classification}`}>
                        Risk: {entry.riskScore}/100
                      </span>
                      <span className="text-xs text-muted">{entry.doctor}</span>
                    </div>
                    <div className="timeline-status">
                      <CheckCircle2 size={12} />
                      <span>{entry.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Medications */}
        <div className="meds-section">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Pill size={20} className="text-purple" />
            Active Medications
          </h3>
          <div className="meds-grid">
            {medications.map((m, i) => (
              <div key={i} className="med-card card card-glow">
                <span className="med-emoji">{m.icon}</span>
                <div className="med-info">
                  <h4>{m.name}</h4>
                  <span className="text-sm text-muted">{m.schedule}</span>
                </div>
                <div className="med-remaining">
                  <span className="text-sm font-semibold">{m.remaining}</span>
                  <span className="text-xs text-muted">left</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
