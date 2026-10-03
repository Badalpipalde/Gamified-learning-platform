import { useState } from 'react';
import api from '../../services/api';

function LinkParent() {
  const [code, setCode] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateCode = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/link/generate');
      setCode(data.code);
      setExpiresAt(new Date(data.expiresAt));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Link Parent</h1>
        <p>Generate a code for your parent to link to your account.</p>
      </div>

      <div className="card" style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>Parent Link Code</h3>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
          Share this code with your parent. They need to enter it in their VidyaQuest account to see your progress.
        </p>

        {error && <div className="auth-error">{error}</div>}

        {code ? (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <div
              style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                letterSpacing: '0.25em',
                color: 'var(--color-primary)',
                background: 'var(--color-primary-bg)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-3)',
              }}
            >
              {code}
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              Expires at {expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ) : null}

        <button
          className="btn btn-primary"
          onClick={generateCode}
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Generating...' : code ? 'Generate New Code' : 'Generate Code'}
        </button>
      </div>
    </div>
  );
}

export default LinkParent;
