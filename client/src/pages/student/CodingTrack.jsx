import { useState } from 'react';
import Level1 from '../../components/coding/Level1';
import Level2 from '../../components/coding/Level2';
import Level3 from '../../components/coding/Level3';
import Level4 from '../../components/coding/Level4';
import '../../assets/styles/pages/coding.css';

function CodingTrack() {
  const [currentLevel, setCurrentLevel] = useState(3);
  const [completedLevels, setCompletedLevels] = useState([]);

  const levels = [
    { id: 1, title: 'Basics (Movement)', description: 'Learn to give sequential instructions.', badge: '🤖' },
    { id: 2, title: 'Variables (Storage)', description: 'Learn to store data in computer memory.', badge: '📦' },
    { id: 3, title: 'Data Types', description: 'Create a character using different types of data.', badge: '🔤' },
    { id: 4, title: 'Operators', description: 'Compare values to make logic decisions.', badge: '➕' },
  ];

  const handleComplete = (levelId) => {
    if (!completedLevels.includes(levelId)) {
      setCompletedLevels([...completedLevels, levelId]);
    }
  };

  const renderLevel = () => {
    switch(currentLevel) {
      case 1:
        return <Level1 onComplete={() => handleComplete(1)} />;
      case 2:
        return <Level2 onComplete={() => handleComplete(2)} />;
      case 3:
        return <Level3 onComplete={() => handleComplete(3)} />;
      case 4:
        return <Level4 onComplete={() => handleComplete(4)} />;
      default:
        return <div>Select a valid level from the sidebar.</div>;
    }
  };

  const activeLevelInfo = levels.find(l => l.id === currentLevel);

  return (
    <div className="page-container" style={{ maxWidth: '1200px' }}>
      
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {activeLevelInfo?.badge} C Code Quest
          <span className="badge badge-primary">Level {currentLevel}: {activeLevelInfo?.title}</span>
        </h1>
        <p>{activeLevelInfo?.description}</p>
      </div>

      <div className="coding-track-layout">
        {/* Sidebar Level Navigation */}
        <div className="card coding-sidebar">
          <h3 style={{ marginBottom: '12px', fontSize: '1.1rem' }}>Learning Path</h3>
          <div className="coding-levels-list">
            {levels.map(lvl => (
              <button 
                key={lvl.id}
                onClick={() => !lvl.locked && setCurrentLevel(lvl.id)}
                disabled={lvl.locked}
                style={{
                  textAlign: 'left',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid ' + (currentLevel === lvl.id ? 'var(--color-primary)' : 'var(--color-border)'),
                  background: currentLevel === lvl.id ? 'var(--color-primary-light)' : 'transparent',
                  color: currentLevel === lvl.id ? 'var(--color-primary-dark)' : 'var(--color-text)',
                  cursor: lvl.locked ? 'not-allowed' : 'pointer',
                  opacity: lvl.locked ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: currentLevel === lvl.id ? 'bold' : 'normal',
                  minHeight: '44px'
                }}
              >
                <span>{lvl.badge}</span>
                <span>Level {lvl.id}</span>
                {completedLevels.includes(lvl.id) && <span style={{ marginLeft: 'auto', color: 'var(--color-success)' }}>✓</span>}
                {lvl.locked && <span style={{ marginLeft: 'auto', fontSize: '12px' }}>🔒</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="coding-main">
          {renderLevel()}
        </div>

      </div>
    </div>
  );
}

export default CodingTrack;
