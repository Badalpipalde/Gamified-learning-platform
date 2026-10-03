import { useState, useRef } from 'react';

function VirtualLab({ question, onComplete, onFail }) {
  // Simple simulation: We have a "flask" (target) and items.
  // The player must drag the correct items into the flask to trigger a reaction.
  
  const [inFlask, setInFlask] = useState([]);
  const [reaction, setReaction] = useState(null);
  
  // Example for MVP: Any item dropped triggers a check.
  // If the item matches the answer, success!
  // In a full game, they'd combine elements. For MVP, we'll just implement drag-and-drop mechanics.
  
  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('text/plain', item);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const item = e.dataTransfer.getData('text/plain');
    if (!item) return;

    setInFlask([...inFlask, item]);
    
    // Check if correct
    if (item === question.answer) {
      setReaction('success');
      setTimeout(() => {
        onComplete();
      }, 1500);
    } else {
      setReaction('explosion');
      setTimeout(() => {
        setInFlask([]);
        setReaction(null);
        // We let them try again instead of strict fail to encourage experimentation,
        // or we can strictly fail them.
        onFail(); 
      }, 1500);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h3 style={{ marginBottom: '20px' }}>Virtual Lab</h3>
      <p style={{ marginBottom: '30px' }}>{question.question}</p>
      
      {/* Workbench (Draggable Items) */}
      <div style={{
        display: 'flex',
        gap: '15px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '40px'
      }}>
        {question.options?.map(opt => (
          <div
            key={opt}
            draggable
            onDragStart={(e) => handleDragStart(e, opt)}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              borderRadius: '8px',
              cursor: 'grab',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            {opt}
          </div>
        ))}
      </div>

      {/* The Flask (Drop Target) */}
      <div 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          width: '200px',
          height: '200px',
          margin: '0 auto',
          border: '4px solid #aaa',
          borderTop: 'none',
          borderRadius: '0 0 50px 50px',
          background: reaction === 'success' ? '#c8e6c9' : reaction === 'explosion' ? '#ffcdd2' : '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: '20px',
          position: 'relative',
          transition: 'background 0.3s'
        }}
      >
        <div style={{ color: '#888', marginBottom: '10px' }}>Drop elements here</div>
        
        {/* Render elements inside flask */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {inFlask.map((item, i) => (
            <span key={i} style={{ background: '#333', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
              {item}
            </span>
          ))}
        </div>
        
        {/* Reaction Effects */}
        {reaction === 'explosion' && (
          <div style={{ position: 'absolute', top: '-50px', fontSize: '4rem' }}>💥</div>
        )}
        {reaction === 'success' && (
          <div style={{ position: 'absolute', top: '-50px', fontSize: '4rem' }}>✨</div>
        )}
      </div>
    </div>
  );
}

export default VirtualLab;
