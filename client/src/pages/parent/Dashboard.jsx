import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../../services/api';
import '../../assets/styles/pages/dashboard.css';

const BAR_COLORS = ['#0F5132', '#1A7A4C', '#27AE60', '#E8A317', '#2980B9', '#C0392B'];

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function ParentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(0);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: d } = await api.get('/dashboard/parent');
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

  if (!data || !data.children || data.children.length === 0) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Parent Dashboard</h1>
          <p>Track your child's learning progress.</p>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">🔗</div>
          <p>No children linked yet. Ask your child to generate a link code from their account, then enter it here.</p>
        </div>
      </div>
    );
  }

  const child = data.children[selectedChild];

  const chartData = child.subjectProgress.map((s) => ({
    name: s.subjectName.en,
    score: s.avgPercent,
  }));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Parent Dashboard</h1>
        <p>Your child's learning progress.</p>
      </div>

      {/* Child selector tabs */}
      {data.children.length > 1 && (
        <div className="child-tabs">
          {data.children.map((c, i) => (
            <button
              key={c._id}
              className={`child-tab ${i === selectedChild ? 'active' : ''}`}
              onClick={() => setSelectedChild(i)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="dash-stats">
        <div className="dash-stat accent">
          <div className="dash-stat-label">Points</div>
          <div className="dash-stat-value">{child.totalPoints}</div>
        </div>
        <div className="dash-stat primary">
          <div className="dash-stat-label">Level</div>
          <div className="dash-stat-value">{child.level}</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-label">Streak</div>
          <div className="dash-stat-value">🔥 {child.streak}</div>
          <div className="dash-stat-sub">days</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-label">Quizzes</div>
          <div className="dash-stat-value">{child.quizzesCompleted}</div>
        </div>
      </div>

      <div className="dash-grid">
        {/* Subject chart */}
        <div className="dash-section">
          <div className="dash-section-header">
            <h3 className="dash-section-title">{child.name}'s Subjects</h3>
          </div>
          {chartData.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-muted)' }}>
              No quizzes attempted yet.
            </div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0DDD8" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={12} />
                  <YAxis type="category" dataKey="name" width={80} fontSize={12} tick={{ fill: '#4A4A4A' }} />
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Avg Score']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E0DDD8', fontSize: '13px' }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="dash-section">
          <div className="dash-section-header">
            <h3 className="dash-section-title">Recent Activity</h3>
          </div>
          {child.recentAttempts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-muted)' }}>
              No activity yet.
            </div>
          ) : (
            <div className="activity-list">
              {child.recentAttempts.map((a) => {
                const pct = Math.round((a.score / a.totalQuestions) * 100);
                const cls = pct >= 80 ? 'good' : pct >= 50 ? 'ok' : 'poor';
                return (
                  <div className="activity-item" key={a._id}>
                    <span className="activity-icon">{a.quizId?.subjectId?.icon || '📝'}</span>
                    <div className="activity-info">
                      <div className="activity-title">{a.quizId?.title?.en || 'Quiz'}</div>
                      <div className="activity-meta">
                        Level {a.quizId?.level} · +{a.pointsEarned} pts · {timeAgo(a.createdAt)}
                      </div>
                    </div>
                    <span className={`activity-score ${cls}`}>{a.score}/{a.totalQuestions}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Badges */}
      {child.badges && child.badges.length > 0 && (
        <div className="dash-section">
          <div className="dash-section-header">
            <h3 className="dash-section-title">Badges ({child.badges.length})</h3>
          </div>
          <div className="badges-shelf">
            {child.badges.map((b) => (
              <div className="badge-item" key={b._id}>
                <span className="badge-item-icon">{b.icon}</span>
                <span className="badge-item-name">{b.name?.en || b.slug}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ParentDashboard;
