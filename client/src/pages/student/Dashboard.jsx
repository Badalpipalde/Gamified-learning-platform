import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Flame, Star, Trophy, BookOpen, Clock, ChevronRight } from 'lucide-react';
import '../../assets/styles/pages/dashboard.css';

const BAR_COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#8B5CF6', '#A78BFA', '#F59E0B'];

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: d } = await api.get('/dashboard/student');
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

  if (!data) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <p>Failed to load dashboard. Please try again.</p>
        </div>
      </div>
    );
  }

  const chartData = data.subjectProgress.map((s) => ({
    name: s.subjectName.en,
    score: s.avgPercent,
    icon: s.subjectIcon,
  }));

  const firstName = user?.name?.split(' ')[0] || 'Student';
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div className="card-glass" style={{ marginBottom: 'var(--space-8)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: 'var(--color-primary)', opacity: '0.1', filter: 'blur(50px)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-50%', left: '10%', width: '200px', height: '200px', background: 'var(--color-accent)', opacity: '0.1', filter: 'blur(50px)', borderRadius: '50%' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-2)' }}>
            {greeting}, {firstName} 👋
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-6)' }}>
            Continue your learning journey and reach your goals.
          </p>
          
          <div className="dash-stats" style={{ marginBottom: 0 }}>
            <div className="dash-stat accent">
              <div className="dash-stat-label">Total Points</div>
              <div className="dash-stat-value" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {data.totalPoints} <Star size={24} color="var(--color-accent-secondary)" />
              </div>
            </div>
            <div className="dash-stat primary">
              <div className="dash-stat-label">Current Level</div>
              <div className="dash-stat-value" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {data.level} <Trophy size={24} color="var(--color-primary)" />
              </div>
            </div>
            <div className="dash-stat" style={{ borderTop: '4px solid #EF4444' }}>
              <div className="dash-stat-label">Learning Streak</div>
              <div className="dash-stat-value" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {data.streak} <Flame size={24} color="#EF4444" />
              </div>
              <div className="dash-stat-sub">Days in a row</div>
            </div>
            <div className="dash-stat" style={{ borderTop: '4px solid #10B981' }}>
              <div className="dash-stat-label">Quizzes Completed</div>
              <div className="dash-stat-value" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {data.quizzesCompleted} <BookOpen size={24} color="#10B981" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        {/* Left: Recent Activity as "Continue Learning" */}
        <div className="dash-section">
          <div className="dash-section-header">
            <h3 className="dash-section-title">Recent Activity</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/student/quizzes')}>
              View all <ChevronRight size={16} />
            </button>
          </div>
          {data.recentAttempts.length === 0 ? (
            <div className="card-flat" style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
              <BookOpen size={48} style={{ opacity: 0.2, margin: '0 auto var(--space-4)' }} />
              <p>No activity yet.</p>
              <button className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }} onClick={() => navigate('/student/quizzes')}>
                Start Learning
              </button>
            </div>
          ) : (
            <div className="activity-list">
              {data.recentAttempts.map((a) => {
                const pct = Math.round((a.score / a.totalQuestions) * 100);
                const cls = pct >= 80 ? 'good' : pct >= 50 ? 'ok' : 'poor';
                return (
                  <div className="activity-item" key={a._id}>
                    <span className="activity-icon">{a.quizId?.subjectId?.icon || '📝'}</span>
                    <div className="activity-info">
                      <div className="activity-title">{a.quizId?.title?.en || 'Quiz'}</div>
                      <div className="activity-meta">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> {timeAgo(a.createdAt)}
                        </span>
                        <span>·</span>
                        <span>Level {a.quizId?.level}</span>
                        <span>·</span>
                        <span style={{ color: 'var(--color-success)' }}>+{a.pointsEarned} pts</span>
                      </div>
                    </div>
                    <span className={`activity-score ${cls}`}>
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Subject Chart & Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          <div className="dash-section" style={{ marginBottom: 0 }}>
            <div className="dash-section-header">
              <h3 className="dash-section-title">Learning Analytics</h3>
            </div>
            {chartData.length === 0 ? (
              <div className="card-flat" style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
                Take some quizzes to see your progress here!
              </div>
            ) : (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={12} stroke="var(--color-text-muted)" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={80}
                      fontSize={13}
                      fontWeight={500}
                      tick={{ fill: 'var(--color-text)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Avg Score']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)', fontSize: '14px', fontWeight: '500' }}
                      cursor={{ fill: 'var(--color-surface-raised)' }}
                    />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={20}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          
          {/* Badges */}
          <div className="dash-section" style={{ marginBottom: 0 }}>
            <div className="dash-section-header">
              <h3 className="dash-section-title">Achievements ({data.badges.length})</h3>
            </div>
            <div className="card-flat">
              {data.badges.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--color-text-muted)' }}>
                  Complete quizzes to earn badges!
                </div>
              ) : (
                <div className="badges-shelf">
                  {data.badges.map((b) => (
                    <div className="badge-item" key={b._id}>
                      <span className="badge-item-icon">{b.icon}</span>
                      <span className="badge-item-name">{b.name?.en || b.slug}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
