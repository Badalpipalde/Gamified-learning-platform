import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/me'); 
        setProfileData(response.data);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  // Fallback to auth user object if API fails
  const displayUser = profileData || user;
  
  const initials = displayUser?.name
    ? displayUser.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>👤 My Profile</h1>
          <p>View your personal information and learning stats.</p>
        </div>
        <button onClick={handleLogout} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--color-danger)', color: 'var(--color-danger)' }}>
          <span>↗</span> Logout
        </button>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', marginBottom: '20px', background: 'var(--color-surface)' }}>
        
        {/* Avatar */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
          color: 'white',
          fontSize: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        }}>
          {initials}
        </div>

        {/* User Info */}
        <h2 style={{ fontSize: '2rem', marginBottom: '5px', color: 'var(--color-text)' }}>{displayUser?.name}</h2>
        <div style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '20px', textTransform: 'capitalize' }}>
          {displayUser?.role}
        </div>

        <div style={{ width: '100%', maxWidth: '500px', marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Email Address</span>
            <span style={{ fontWeight: '500' }}>{displayUser?.email}</span>
          </div>

          {displayUser?.role === 'student' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Class</span>
                <span style={{ fontWeight: '500' }}>{displayUser.className || <span style={{color: '#999', fontStyle: 'italic'}}>Not specified</span>}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Section</span>
                <span style={{ fontWeight: '500' }}>{displayUser.section || <span style={{color: '#999', fontStyle: 'italic'}}>Not specified</span>}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Roll Number</span>
                <span style={{ fontWeight: '500' }}>{displayUser.rollNo || <span style={{color: '#999', fontStyle: 'italic'}}>Not specified</span>}</span>
              </div>
            </>
          )}
          
          {displayUser?.totalPoints !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Total Experience (XP)</span>
              <span style={{ fontWeight: 'bold', color: 'var(--color-warning)' }}>⭐ {displayUser.totalPoints}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Account Created</span>
            <span style={{ fontWeight: '500' }}>{new Date(displayUser?.createdAt || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>

      </div>

      {/* Gamification Stats Card */}
      <div className="card" style={{ display: 'flex', gap: '20px', justifyContent: 'space-around', padding: '30px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎯</div>
          <h3 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--color-text)' }}>{displayUser?.quizzesTaken || 0}</h3>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Quizzes Taken</div>
        </div>
        <div style={{ width: '1px', background: 'var(--color-border)' }}></div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔥</div>
          <h3 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--color-text)' }}>{displayUser?.streak || 0} Days</h3>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Current Streak</div>
        </div>
        <div style={{ width: '1px', background: 'var(--color-border)' }}></div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🏆</div>
          <h3 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--color-text)' }}>{displayUser?.rank || 'Unranked'}</h3>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Global Rank</div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
