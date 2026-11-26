import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { getCached, setCached } from '../../utils/cache';
import '../../assets/styles/pages/quiz.css';

const RANK_ICONS = ['🥇', '🥈', '🥉'];

function Leaderboard() {
  const { user } = useAuth();
  const classId = user?.classId ? (typeof user.classId === 'object' ? user.classId._id : user.classId) : null;
  const cacheKey = classId ? `leaderboard:${classId}` : null;
  const cached = cacheKey ? getCached(cacheKey, 60_000) : null;

  const [leaderboard, setLeaderboard] = useState(cached?.data || []);
  const [loading, setLoading] = useState(classId ? !cached?.data : false);

  useEffect(() => {
    if (!classId) {
      setLoading(false);
      return;
    }

    let active = true;
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get(`/points/leaderboard/${classId}`);
        if (!active) return;
        setLeaderboard(data);
        setCached(cacheKey, data);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchLeaderboard();
    return () => { active = false; };
  }, [classId, cacheKey]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loader"><div className="spinner"></div></div>
      </div>
    );
  }

  if (!user?.classId) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Leaderboard</h1>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <p>You need to be assigned to a class to see the leaderboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Leaderboard</h1>
        <p>See how you rank against your classmates.</p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <p>No scores yet. Be the first to take a quiz!</p>
        </div>
      ) : (
        <div className="leaderboard-list">
          {leaderboard.map((entry) => {
            const isMe = entry._id === user._id;
            return (
              <div
                className={`leaderboard-row ${isMe ? 'is-me' : ''}`}
                key={entry._id}
              >
                <div className={`leaderboard-rank ${entry.rank <= 3 ? 'top-3' : ''}`}>
                  {entry.rank <= 3 ? RANK_ICONS[entry.rank - 1] : `#${entry.rank}`}
                </div>
                <div className="leaderboard-info">
                  <div className="leaderboard-name">
                    {entry.name} {isMe && '(You)'}
                  </div>
                  <div className="leaderboard-level">
                    Level {entry.level} · 🔥 {entry.streak} day streak · 🏅 {entry.badgeCount} badges
                  </div>
                </div>
                <div className="leaderboard-points">
                  {entry.totalPoints} pts
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
