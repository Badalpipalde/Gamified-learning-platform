import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import '../../assets/styles/pages/dashboard.css';

const BAR_COLORS = ['#C0392B', '#E8A317', '#27AE60', '#0F5132', '#2980B9', '#8E44AD'];

function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: d } = await api.get('/dashboard/teacher');
        setData(d);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loader"><div className="spinner"></div></div>
      </div>
    );
  }

  if (!data || data.classes.length === 0) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Teacher Dashboard</h1>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">🏫</div>
          <p>No class assigned yet. Ask your admin to assign you a class.</p>
        </div>
      </div>
    );
  }

  const { summary, topPerformers, subjectStats } = data;

  const chartData = subjectStats.map((s) => ({
    name: s.subjectName.en,
    score: s.avgPercent,
    students: s.studentCount,
    attempts: s.totalAttempts,
  }));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Welcome, {user?.name?.split(' ')[0]}!</h1>
        <p>
          {data.classes.map((c) => `${c.name}${c.section ? ' - ' + c.section : ''}`).join(', ')}
        </p>
      </div>

      {/* Stats */}
      <div className="dash-stats">
        <div className="dash-stat primary">
          <div className="dash-stat-label">Active Students</div>
          <div className="dash-stat-value">{summary.totalStudents}</div>
          {summary.inactiveStudents > 0 && (
            <div className="dash-stat-sub">{summary.inactiveStudents} inactive</div>
          )}
        </div>
        <div className="dash-stat accent">
          <div className="dash-stat-label">Avg Points</div>
          <div className="dash-stat-value">{summary.avgPoints}</div>
          <div className="dash-stat-sub">per student</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-label">Quizzes This Week</div>
          <div className="dash-stat-value">{summary.recentActivity}</div>
          <div className="dash-stat-sub">attempts</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-label">Subjects Covered</div>
          <div className="dash-stat-value">{subjectStats.length}</div>
        </div>
      </div>

      <div className="dash-grid">
        {/* Subject performance chart (weakest first) */}
        <div className="dash-section">
          <div className="dash-section-header">
            <h3 className="dash-section-title">Class Subject Performance</h3>
          </div>
          {chartData.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-muted)' }}>
              No quiz data yet. Students haven't attempted any quizzes.
            </div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0DDD8" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={12} />
                  <YAxis type="category" dataKey="name" width={80} fontSize={12} tick={{ fill: '#4A4A4A' }} />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'score') return [`${value}%`, 'Avg Score'];
                      return [value, name];
                    }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E0DDD8', fontSize: '13px' }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                    {chartData.map((entry, i) => {
                      const color = entry.score >= 70 ? '#27AE60' : entry.score >= 50 ? '#E8A317' : '#C0392B';
                      return <Cell key={i} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {chartData.length > 0 && subjectStats[0]?.avgPercent < 50 && (
            <div
              style={{
                marginTop: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--color-danger-bg)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-danger)',
              }}
            >
              ⚠️ <strong>{subjectStats[0].subjectName.en}</strong> needs attention — avg score {subjectStats[0].avgPercent}%
            </div>
          )}
        </div>

        {/* Top performers */}
        <div className="dash-section">
          <div className="dash-section-header">
            <h3 className="dash-section-title">Top Performers</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/teacher/students')}>
              View all →
            </button>
          </div>
          {topPerformers.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-muted)' }}>
              No student data yet.
            </div>
          ) : (
            <div className="activity-list">
              {topPerformers.map((s) => {
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div className="activity-item" key={s._id}>
                    <span className="activity-icon" style={{ fontSize: '1.5rem' }}>
                      {s.rank <= 3 ? medals[s.rank - 1] : `#${s.rank}`}
                    </span>
                    <div className="activity-info">
                      <div className="activity-title">{s.name}</div>
                      <div className="activity-meta">
                        {s.rollNo ? `Roll ${s.rollNo} · ` : ''}Level {s.level}
                      </div>
                    </div>
                    <span className="activity-score good">{s.totalPoints} pts</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
