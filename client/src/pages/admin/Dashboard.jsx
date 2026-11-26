import { useState, useEffect } from 'react';
import api from '../../services/api';
import { getCached, setCached } from '../../utils/cache';

function AdminDashboard() {
  const cached = getCached('dashboard:admin', 60_000);
  const [data, setData] = useState(cached?.data || null);
  const [loading, setLoading] = useState(!cached?.data);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/admin');
        if (!active) return;
        setData(res.data);
        setCached('dashboard:admin', res.data);
      } catch (err) {
        if (active && !cached?.data) setError('Failed to load dashboard data');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchDashboard();
    return () => { active = false; };
  }, []);

  if (loading) {
    return <div className="loader"><div className="spinner"></div></div>;
  }

  if (error) {
    return <div className="auth-error">{error}</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Platform overview and statistics.</p>
      </div>
      
      <div className="dash-grid">
        <div className="card">
          <h3>👥 Users</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-4)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{data.users.students}</div>
              <div style={{ color: 'var(--color-text-muted)' }}>Students</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>{data.users.teachers}</div>
              <div style={{ color: 'var(--color-text-muted)' }}>Teachers</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-accent-dark)' }}>{data.users.parents}</div>
              <div style={{ color: 'var(--color-text-muted)' }}>Parents</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>📚 Content</h3>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-4)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{data.content.classes}</div>
              <div style={{ color: 'var(--color-text-muted)' }}>Classes</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>📈 Engagement</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-4)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-accent)' }}>{data.engagement.platformPoints}</div>
              <div style={{ color: 'var(--color-text-muted)' }}>Total Points Earned</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-success)' }}>{data.engagement.recentAttempts}</div>
              <div style={{ color: 'var(--color-text-muted)' }}>Quizzes (30 Days)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
