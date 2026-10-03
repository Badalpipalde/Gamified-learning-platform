import { useState, useEffect } from 'react';
import api from '../../services/api';

function QuizManagement() {
  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    subjectId: '',
    titleEn: '',
    titleHi: '',
    level: 1,
  });

  const fetchData = async () => {
    try {
      const [quizRes, subjRes] = await Promise.all([
        api.get('/admin/quizzes'),
        api.get('/admin/subjects')
      ]);
      setQuizzes(quizRes.data);
      setSubjects(subjRes.data);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.subjectId) {
      setError('Please select a subject');
      return;
    }

    try {
      await api.post('/admin/quizzes', {
        subjectId: formData.subjectId,
        title: {
          en: formData.titleEn,
          hi: formData.titleHi
        },
        level: parseInt(formData.level)
      });
      
      setSuccess('Quiz created successfully!');
      setFormData({ subjectId: formData.subjectId, titleEn: '', titleHi: '', level: 1 });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quiz');
    }
  };

  if (loading) {
    return <div className="loader"><div className="spinner"></div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Quiz Management</h1>
        <p>Create and manage quizzes for subjects.</p>
      </div>

      <div className="dash-grid">
        {/* Create Quiz Form */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Create New Quiz</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="subjectId">Subject</label>
              <select
                id="subjectId"
                name="subjectId"
                className="form-input"
                value={formData.subjectId}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Subject --</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.name.en}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="titleEn">Title (English)</label>
              <input
                type="text"
                id="titleEn"
                name="titleEn"
                className="form-input"
                value={formData.titleEn}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="titleHi">Title (Hindi)</label>
              <input
                type="text"
                id="titleHi"
                name="titleHi"
                className="form-input"
                value={formData.titleHi}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="level">Difficulty Level (1-5)</label>
              <input
                type="number"
                id="level"
                name="level"
                className="form-input"
                min="1"
                max="5"
                value={formData.level}
                onChange={handleChange}
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}
            {success && <div style={{ color: 'var(--color-success)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>{success}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Create Quiz
            </button>
          </form>
        </div>

        {/* Quiz List */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Existing Quizzes</h3>
          {quizzes.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No quizzes found.</p>
          ) : (
            <div className="activity-list">
              {quizzes.map((q) => (
                <div className="activity-item" key={q._id}>
                  <div className="activity-icon">{q.subjectId?.icon || '📝'}</div>
                  <div className="activity-info">
                    <div className="activity-title">{q.title.en}</div>
                    <div className="activity-meta">
                      {q.subjectId?.name?.en} · Level {q.level} · {q.questions?.length || 0} Questions
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizManagement;
