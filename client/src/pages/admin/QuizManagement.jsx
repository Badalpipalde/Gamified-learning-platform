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
