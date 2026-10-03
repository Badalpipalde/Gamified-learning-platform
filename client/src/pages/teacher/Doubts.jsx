import { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../assets/styles/pages/doubts.css';

function TeacherDoubts() {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reply state (doubtId -> text)
  const [replyText, setReplyText] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);

  const fetchDoubts = async () => {
    try {
      const { data } = await api.get('/doubts/teacher');
      setDoubts(data);
    } catch (err) {
      console.error('Failed to fetch doubts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, []);

  const handleReply = async (doubtId) => {
    const text = replyText[doubtId];
    if (!text || !text.trim()) return;

    setReplyingTo(doubtId);
    try {
      await api.post(`/doubts/${doubtId}/replies`, { text });
      setReplyText({ ...replyText, [doubtId]: '' });
      fetchDoubts();
    } catch (err) {
      alert('Failed to send reply');
    } finally {
      setReplyingTo(null);
    }
  };

  const handleStatusChange = async (doubtId, newStatus) => {
    try {
      await api.patch(`/doubts/${doubtId}/status`, { status: newStatus });
      fetchDoubts();
    } catch (err) {
      alert('Failed to update status');
    }
  };

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
        <h1>Student Doubts</h1>
        <p>Answer questions from students in your classes.</p>
      </div>

      {doubts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👍</div>
          <p>No doubts to answer! Your students are doing great.</p>
        </div>
      ) : (
        <div className="doubts-container">
          {doubts.map((doubt) => (
            <div className="doubt-card" key={doubt._id}>
              <div className="doubt-header">
                <div>
                  <h3 className="doubt-title">{doubt.title}</h3>
                  <div className="doubt-meta">
                    <span style={{ fontWeight: '500', color: 'var(--color-text)' }}>
                      {doubt.studentId?.name} {doubt.studentId?.rollNo ? `(Roll: ${doubt.studentId.rollNo})` : ''}
                    </span>
                    <span>·</span>
                    {doubt.subjectId && <span>{doubt.subjectId.icon} {doubt.subjectId.name.en}</span>}
                    {doubt.subjectId && <span>·</span>}
                    <span>{new Date(doubt.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                  <select
                    className="form-input"
                    style={{ padding: '4px 8px', fontSize: 'var(--font-size-sm)', minHeight: 'unset', width: 'auto' }}
                    value={doubt.status}
                    onChange={(e) => handleStatusChange(doubt._id, e.target.value)}
                  >
                    <option value="open">Open</option>
                    <option value="answered">Answered</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              
              <div className="doubt-desc">{doubt.description}</div>

              {/* Replies */}
              <div className="replies-section">
                {doubt.replies.map((reply) => (
                  <div className={`reply-item ${reply.userId.role === 'teacher' ? 'teacher' : ''}`} key={reply._id}>
                    <div className="reply-header">
                      <span className={`reply-author ${reply.userId.role === 'teacher' ? 'teacher' : ''}`}>
                        {reply.userId.name} {reply.userId.role === 'teacher' ? '(You)' : ''}
                      </span>
                      <span className="reply-time">{new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="reply-text">{reply.text}</div>
                  </div>
                ))}

                {doubt.status !== 'closed' && (
                  <div className="reply-form">
                    <input
                      type="text"
                      className="form-input reply-input"
                      placeholder="Type your answer..."
                      value={replyText[doubt._id] || ''}
                      onChange={(e) => setReplyText({ ...replyText, [doubt._id]: e.target.value })}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={() => handleReply(doubt._id)}
                      disabled={replyingTo === doubt._id || !replyText[doubt._id]?.trim()}
                    >
                      Reply
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TeacherDoubts;
