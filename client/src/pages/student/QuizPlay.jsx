import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import api from '../../services/api';
import '../../assets/styles/pages/quiz.css';

const LETTERS = ['A', 'B', 'C', 'D'];

function QuizPlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { width, height } = useWindowSize();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await api.get(`/quizzes/${id}`);
        setQuiz(data.quiz);
        setQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(-1));
      } catch (err) {
        console.error('Failed to fetch quiz:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const selectOption = (optionIdx) => {
    const updated = [...answers];
    updated[currentIdx] = optionIdx;
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    // Check all answered
    const unanswered = answers.filter((a) => a === -1).length;
    if (unanswered > 0) {
      if (!window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const { data } = await api.post('/attempts', {
        quizId: id,
        answers,
        timeTaken,
      });
      setResults(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loader"><div className="spinner"></div></div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <p>Quiz not found or has no questions.</p>
          <button className="btn btn-primary" onClick={() => navigate('/student/quizzes')}>
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  // ---- RESULTS VIEW ----
  if (results) {
    const { attempt, results: reviewItems, streak, streakBonus, totalPoints, level, newBadges } = results;
    const pct = Math.round((attempt.score / attempt.totalQuestions) * 100);
    const ringClass = pct >= 80 ? 'good' : pct >= 50 ? 'ok' : 'poor';

    return (
      <div className="page-container quiz-play">
        <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.15} />
        <div className="results-card">
          <div className={`results-score-ring ${ringClass}`}>
            <span className="results-score-value">{pct}%</span>
          </div>
          <div className="results-score-label">
            {attempt.score} out of {attempt.totalQuestions} correct
          </div>

          <div className="results-stats">
            <div>
              <div className="results-stat-value" style={{ color: 'var(--color-accent-dark)' }}>
                +{attempt.pointsEarned}
              </div>
              <div className="results-stat-label">Points earned</div>
            </div>
            <div>
              <div className="results-stat-value">{streak}</div>
              <div className="results-stat-label">Day streak</div>
            </div>
            <div>
              <div className="results-stat-value">Lv.{level}</div>
              <div className="results-stat-label">{totalPoints} pts total</div>
            </div>
          </div>

          {streakBonus > 0 && (
            <div className="badge badge-accent" style={{ marginBottom: 'var(--space-4)' }}>
              🔥 Streak bonus: +{streakBonus} points!
            </div>
          )}

          {newBadges && newBadges.length > 0 && (
            <div className="results-badges">
              {newBadges.map((b) => (
                <div className="results-badge" key={b._id}>
                  {b.icon} {b.name.en}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/student/quizzes')}>
              More Quizzes
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/student/leaderboard')}>
              Leaderboard
            </button>
          </div>
        </div>

        {/* Review answers */}
        <div className="results-review">
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Review Answers</h3>
          {reviewItems.map((r, i) => (
            <div className={`review-item ${r.correct ? 'correct' : 'wrong'}`} key={i}>
              <div className="review-question">
                {i + 1}. {questions[i]?.text?.en || 'Question'}
              </div>
              <div className="review-answer">
                Your answer: {LETTERS[r.selected] || '—'}{' '}
                {r.correct ? '✓' : `✗ (Correct: ${LETTERS[r.correctIndex]})`}
              </div>
              {r.explanation?.en && (
                <div className="review-answer" style={{ marginTop: 'var(--space-1)', fontStyle: 'italic' }}>
                  {r.explanation.en}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---- QUIZ PLAY VIEW ----
  const question = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="page-container quiz-play">
      <div className="quiz-play-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/student/quizzes')}>
          ← Back
        </button>
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
          {quiz.title.en}
        </span>
      </div>

      <div className="quiz-play-progress">
        <div className="quiz-play-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="quiz-play-question-num">
        Question {currentIdx + 1} of {questions.length}
      </div>

      <div className="quiz-play-question-text">
        {question.text.en}
      </div>

      <div className="quiz-play-options">
        {question.options.map((opt, i) => (
          <button
            key={i}
            className={`quiz-option ${answers[currentIdx] === i ? 'selected' : ''}`}
            onClick={() => selectOption(i)}
          >
            <span className="quiz-option-letter">{LETTERS[i]}</span>
            <span>{opt.en}</span>
          </button>
        ))}
      </div>

      <div className="quiz-play-nav">
        <button
          className="btn btn-ghost"
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx(currentIdx - 1)}
        >
          ← Previous
        </button>

        {currentIdx < questions.length - 1 ? (
          <button
            className="btn btn-primary"
            onClick={() => setCurrentIdx(currentIdx + 1)}
          >
            Next →
          </button>
        ) : (
          <button
            className="btn btn-accent"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>
    </div>
  );
}

export default QuizPlay;
