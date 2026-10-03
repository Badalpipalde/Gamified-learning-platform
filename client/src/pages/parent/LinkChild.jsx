import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function LinkChild() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [children, setChildren] = useState([]);
  const navigate = useNavigate();

  const fetchChildren = async () => {
    try {
      const { data } = await api.get('/link/children');
      setChildren(data);
    } catch (err) {
      console.error('Failed to fetch children', err);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleLink = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-character code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.post('/link/redeem', { code });
      setSuccess(`Successfully linked to ${data.student.name}!`);
      setCode('');
      fetchChildren();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to link account');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to unlink ${studentName}?`)) return;

    try {
      await api.delete(`/link/children/${studentId}`);
      fetchChildren();
    } catch (err) {
      alert('Failed to unlink child');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Link Child</h1>
        <p>Enter the code from your child's account to link them.</p>
      </div>

      <div className="dash-grid">
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Link New Child</h3>
          <form onSubmit={handleLink}>
            <div className="form-group">
              <label className="form-label" htmlFor="code">6-Character Code</label>
              <input
                type="text"
                id="code"
                className="form-input"
                placeholder="e.g. A1B2C3"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </div>
            
            {error && <div className="auth-error">{error}</div>}
            {success && <div style={{ color: 'var(--color-success)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>{success}</div>}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Linking...' : 'Link Child'}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Linked Children</h3>
          {children.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No children linked yet.</p>
          ) : (
            <div className="activity-list">
              {children.map((child) => (
                <div className="activity-item" key={child._id}>
                  <div className="activity-info">
                    <div className="activity-title">{child.name}</div>
                    <div className="activity-meta">
                      Level {child.level} · {child.totalPoints} pts
                    </div>
                  </div>
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleUnlink(child._id, child.name)}
                    style={{ color: 'var(--color-danger)' }}
                  >
                    Unlink
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LinkChild;
