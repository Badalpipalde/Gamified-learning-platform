import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../assets/styles/pages/quiz.css';

function LevelDots({ level }) {
  return (
    <div className="level-dots">
      {[1, 2, 3, 4, 5].map((d) => (
        <span key={d} className={`level-dot ${d <= level ? 'filled' : ''}`} />
      ))}
    </div>
  );
}

function Quizzes() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizLoading, setQuizLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data } = await api.get('/quizzes/subjects');
        setSubjects(data);
      } catch (err) {
        console.error('Failed to fetch subjects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const selectSubject = async (subject) => {
    setSelectedSubject(subject);
    setQuizLoading(true);
    try {
      const { data } = await api.get(`/quizzes?subject=${subject.slug}`);
      setQuizzes(data);
    } catch (err) {
      console.error('Failed to fetch quizzes:', err);
    } finally {
      setQuizLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loader"><div className="spinner"></div></div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Quizzes</h1>
        <p>Pick a subject and test your knowledge.</p>
      </div>

      {/* Subject cards */}
      <div className="subjects-grid">
        {subjects.map((s) => (
          <button
            key={s._id}
            className={`subject-card ${selectedSubject?._id === s._id ? 'active' : ''}`}
            onClick={() => selectSubject(s)}
          >
            <div className="subject-card-icon">{s.icon}</div>
            <div className="subject-card-name">{s.name.en}</div>
          </button>
        ))}
      </div>

      {/* Quiz list */}
      {selectedSubject && (
        <div style={{ marginTop: 'var(--space-8)' }}>
          <h2 style={{ marginBottom: 'var(--space-4)' }}>
            {selectedSubject.icon} {selectedSubject.name.en}
          </h2>

          {quizLoading ? (
            <div className="loader"><div className="spinner"></div></div>
          ) : quizzes.length === 0 ? (
            <div className="empty-state">
              <p>No quizzes available for this subject yet.</p>
            </div>
          ) : (
            <div className="quiz-list">
              {quizzes.map((q) => (
                <div className="quiz-row" key={q._id}>
                  <div className="quiz-row-info">
                    <div className="quiz-row-title">{q.title.en}</div>
                    <div className="quiz-row-meta">
                      <LevelDots level={q.level} />
                      <span>Level {q.level}</span>
                      <span>·</span>
                      <span>{q.questionCount} questions</span>
                    </div>
                  </div>
                  <div className="quiz-row-score">
                    {q.attempted && (
                      <div className="score-text">
                        Best: {q.bestScore}/{q.bestTotal}
                      </div>
                    )}
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/student/quiz/${q._id}`)}
                    >
                      {q.attempted ? 'Retry' : 'Start'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Quizzes;
