import { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../assets/styles/pages/doubts.css';

function Doubts() {
  const [doubts, setDoubts] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New doubt form state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reply state (doubtId -> text)
  const [replyText, setReplyText] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);

  const fetchDoubts = async () => {
    try {
      const { data } = await api.get('/doubts/student');
      setDoubts(data);
    } catch (err) {
      console.error('Failed to fetch doubts', err);
    }
  };

  useEffect(() => {
    fetchDoubts();
    // Also fetch subjects for the dropdown
    api.get('/quizzes/subjects').then((res) => setSubjects(res.data)).catch(console.error);
    setLoading(false);
  }, []);

  const handleSubmitDoubt = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post('/doubts', { title, description, subjectId: subjectId || undefined });
      setShowForm(false);
      setTitle('');
      setDescription('');
      setSubjectId('');
      fetchDoubts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit doubt');
    } finally {
      setSubmitting(false);
    }
  };

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

  if (loading) {
    return (
      <div className="page-container">
        <div className="loader"><div className="spinner"></div></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>My Doubts</h1>
          <p>Ask questions and get help from your teachers.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Ask a Doubt'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Ask a New Doubt</h3>
          <form onSubmit={handleSubmitDoubt}>
            <div className="form-group">
              <label className="form-label" htmlFor="subject">Subject (Optional)</label>
              <select
                id="subject"
                className="form-input"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
              >
                <option value="">-- Select Subject --</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.name.en}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="title">Title / Summary</label>
              <input
                type="text"
                id="title"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., How does photosynthesis work?"
                maxLength={200}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="desc">Description</label>
              <textarea
                id="desc"
                className="form-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what you are struggling with..."
                rows="4"
                maxLength={2000}
              ></textarea>
            </div>
            
            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Post Doubt'}
            </button>
          </form>
        </div>
      )}

      {doubts.length === 0 && !showForm ? (
        <div className="empty-state">
          <div className="empty-state-icon">❓</div>
          <p>You haven't asked any doubts yet.</p>
        </div>
      ) : (
        <div className="doubts-container">
          {doubts.map((doubt) => (
            <div className="doubt-card" key={doubt._id}>
              <div className="doubt-header">
                <div>
                  <h3 className="doubt-title">{doubt.title}</h3>
                  <div className="doubt-meta">
                    {doubt.subjectId && <span>{doubt.subjectId.icon} {doubt.subjectId.name.en}</span>}
                    <span>·</span>
                    <span>{new Date(doubt.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`doubt-status ${doubt.status}`}>{doubt.status}</span>
              </div>
              
              <div className="doubt-desc">{doubt.description}</div>

              {/* Replies */}
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

                {doubt.status !== 'closed' && (
                  <div className="reply-form">
                    <input
                      type="text"
                      className="form-input reply-input"
                      placeholder="Add a reply..."
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

export default Doubts;
