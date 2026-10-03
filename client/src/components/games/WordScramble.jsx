import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function WordScramble({ question, onComplete, onFail }) {
  const targetWord = (question.answer || "APPLE").toUpperCase();
  const [jumbled, setJumbled] = useState([]);
  const [selected, setSelected] = useState([]);
  const [status, setStatus] = useState('playing'); // playing, correct, wrong

  useEffect(() => {
    const letters = targetWord.split('');
    // Fisher-Yates shuffle
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    
    setJumbled(letters.map((char, id) => ({ char, id, isSelected: false })));
    setSelected([]);
    setStatus('playing');
  }, [question, targetWord]);

  const handleSelect = (tile) => {
    if (tile.isSelected || status !== 'playing') return;
    
    const newSelected = [...selected, tile];
    setSelected(newSelected);
    
    setJumbled(jumbled.map(t => t.id === tile.id ? { ...t, isSelected: true } : t));

    if (newSelected.length === targetWord.length) {
      const spelled = newSelected.map(t => t.char).join('');
      if (spelled === targetWord) {
        setStatus('correct');
        setTimeout(onComplete, 1200);
      } else {
        setStatus('wrong');
        setTimeout(() => {
          onFail();
        }, 1200);
      }
    }
  };

  const handleReset = () => {
    if (status !== 'playing') return;
    setJumbled(jumbled.map(t => ({ ...t, isSelected: false })));
    setSelected([]);
  };

  return (
    <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#fff3e0', borderRadius: '16px', minHeight: '400px' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '30px', color: '#e65100' }}>{question.question}</h2>
      
      {/* Answer Slots */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px', 
        marginBottom: '40px',
        minHeight: '60px'
      }}>
        {Array.from({ length: targetWord.length }).map((_, i) => {
          const tile = selected[i];
          return (
            <div key={i} style={{
              width: '50px', height: '50px',
              backgroundColor: tile ? (status === 'correct' ? '#4caf50' : status === 'wrong' ? '#f44336' : '#ffb74d') : 'transparent',
              border: `2px ${tile ? 'solid' : 'dashed'} ${tile ? (status === 'correct' ? '#2e7d32' : status === 'wrong' ? '#c62828' : '#ef6c00') : '#ffcc80'}`,
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 'bold', color: 'white',
              boxShadow: tile ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
              transition: 'background-color 0.3s'
            }}>
              {tile ? tile.char : ''}
            </div>
          );
        })}
      </div>

      {/* Jumbled Letters */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '15px', 
        flexWrap: 'wrap',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        {jumbled.map(tile => (
          <motion.button
            key={tile.id}
            whileHover={!tile.isSelected ? { scale: 1.1 } : {}}
            whileTap={!tile.isSelected ? { scale: 0.9 } : {}}
            onClick={() => handleSelect(tile)}
            style={{
              width: '60px', height: '60px',
              backgroundColor: tile.isSelected ? '#e0e0e0' : '#4fc3f7',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.8rem', fontWeight: 'bold', color: tile.isSelected ? '#9e9e9e' : 'white',
              cursor: tile.isSelected ? 'default' : 'pointer',
              boxShadow: tile.isSelected ? 'none' : '0 4px 0 #0288d1',
              transform: tile.isSelected ? 'translateY(4px)' : 'none',
              transition: 'all 0.1s'
            }}
          >
            {tile.char}
          </motion.button>
        ))}
      </div>

      {status === 'playing' && (
        <button 
          onClick={handleReset}
          style={{
            marginTop: '40px', padding: '10px 20px',
            backgroundColor: '#ff5252', color: 'white',
            border: 'none', borderRadius: '8px',
            fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold',
            boxShadow: '0 4px 0 #d32f2f'
          }}
        >
          Reset Word
        </button>
      )}

      {status === 'correct' && (
        <div style={{ marginTop: '30px', fontSize: '2rem', color: '#4caf50', fontWeight: 'bold' }}>
          Perfect! ✅
        </div>
      )}
      {status === 'wrong' && (
        <div style={{ marginTop: '30px', fontSize: '2rem', color: '#f44336', fontWeight: 'bold' }}>
          Oops! Try again. ❌
        </div>
      )}
    </div>
  );
}

export default WordScramble;
