import { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../assets/styles/pages/doubts.css';

function ParentDoubts() {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoubts = async () => {
      try {
        const { data } = await api.get('/doubts/parent');
        setDoubts(data);
      } catch (err) {
        setError('Failed to load doubts.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoubts();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loader"><div className="spinner"></div></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Children's Doubts</h1>
        <p>Monitor the questions your children are asking their teachers.</p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      {doubts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👀</div>
          <p>No doubts have been asked by your linked children yet.</p>
        </div>
      ) : (
        <div className="doubts-container">
          {doubts.map((doubt) => (
            <div className="doubt-card" key={doubt._id}>
              <div className="doubt-header">
                <div>
                  <h3 className="doubt-title">{doubt.title}</h3>
                  <div className="doubt-meta">
                    <span style={{ fontWeight: '500', color: 'var(--color-primary-dark)' }}>
                      Child: {doubt.studentId?.name}
                    </span>
                    <span>·</span>
                    {doubt.subjectId && <span>{doubt.subjectId.icon} {doubt.subjectId.name.en}</span>}
                    {doubt.subjectId && <span>·</span>}
                    <span>{new Date(doubt.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`doubt-status ${doubt.status}`}>{doubt.status}</span>
              </div>
              
              <div className="doubt-desc">{doubt.description}</div>

              {/* Replies */}
              {doubt.replies.length > 0 && (
                <div className="replies-section">
                  {doubt.replies.map((reply) => (
                    <div className={`reply-item ${reply.userId.role === 'teacher' ? 'teacher' : ''}`} key={reply._id}>
                      <div className="reply-header">
                        <span className={`reply-author ${reply.userId.role === 'teacher' ? 'teacher' : ''}`}>
                          {reply.userId.name} {reply.userId.role === 'teacher' && '(Teacher)'}
                        </span>
                        <span className="reply-time">{new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="reply-text">{reply.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ParentDoubts;
