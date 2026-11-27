import { useState } from 'react';
import { motion } from 'framer-motion';

function buildJumbledLetters(targetWord) {
  const letters = targetWord.split('');
  if (letters.length > 1) {
    // Shuffle until different from targetWord (up to 6 tries)
    for (let attempt = 0; attempt < 6; attempt++) {
      for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
      }
      if (letters.join('') !== targetWord) break;
    }
  }
  return letters.map((char, id) => ({ char, id, isSelected: false }));
}

function WordScramble({ question, onComplete, onFail }) {
  const targetWord = (question.answer || 'APPLE').toUpperCase();
  const [jumbled, setJumbled] = useState(() => buildJumbledLetters(targetWord));
  const [selected, setSelected] = useState([]);
  const [status, setStatus] = useState('playing'); // playing, correct, wrong

  const handleSelect = (tile) => {
    if (tile.isSelected || status !== 'playing') return;

    const newSelected = [...selected, tile];
    setSelected(newSelected);
    setJumbled((prev) => prev.map((t) => (t.id === tile.id ? { ...t, isSelected: true } : t)));

    if (newSelected.length === targetWord.length) {
      const spelled = newSelected.map((t) => t.char).join('');
      if (spelled === targetWord) {
        setStatus('correct');
        onComplete();
      } else {
        setStatus('wrong');
        onFail();
      }
    }
  };

  // Allow clicking a placed letter in the answer slot to return it to the bank
  const handleRemoveSlot = (slotIndex) => {
    if (status !== 'playing') return;
    const tile = selected[slotIndex];
    if (!tile) return;

    setSelected((prev) => prev.filter((_, idx) => idx !== slotIndex));
    setJumbled((prev) => prev.map((t) => (t.id === tile.id ? { ...t, isSelected: false } : t)));
  };

  const handleReset = () => {
    if (status !== 'playing') return;
    setJumbled((prev) => prev.map((t) => ({ ...t, isSelected: false })));
    setSelected([]);
  };

  return (
    <div
      style={{
        textAlign: 'center',
        padding: 'clamp(16px, 4vw, 30px)',
        backgroundColor: '#fff3e0',
        borderRadius: '16px',
        minHeight: '340px',
      }}
    >
      <h2 style={{ fontSize: 'clamp(1.15rem, 4vw, 1.8rem)', marginBottom: '8px', color: '#e65100' }}>
        {question.question}
      </h2>
      <p style={{ fontSize: '0.8rem', color: '#9a3412', marginBottom: '20px' }}>
        Tap letters below to spell the word (tap a filled box to undo).
      </p>

      {/* Answer Slots */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '28px',
          minHeight: '48px',
        }}
      >
        {Array.from({ length: targetWord.length }).map((_, i) => {
          const tile = selected[i];
          return (
            <button
              type="button"
              key={i}
              onClick={() => tile && handleRemoveSlot(i)}
              disabled={!tile || status !== 'playing'}
              style={{
                width: 'clamp(32px, 9vw, 50px)',
                height: 'clamp(36px, 9vw, 50px)',
                backgroundColor: tile
                  ? status === 'correct'
                    ? '#4caf50'
                    : status === 'wrong'
                    ? '#f44336'
                    : '#ffb74d'
                  : 'transparent',
                border: `2px ${tile ? 'solid' : 'dashed'} ${
                  tile
                    ? status === 'correct'
                      ? '#2e7d32'
                      : status === 'wrong'
                      ? '#c62828'
                      : '#ef6c00'
                    : '#ffcc80'
                }`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(1rem, 4vw, 1.5rem)',
                fontWeight: 'bold',
                color: 'white',
                cursor: tile && status === 'playing' ? 'pointer' : 'default',
                boxShadow: tile ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
                transition: 'background-color 0.25s',
              }}
            >
              {tile ? tile.char : ''}
            </button>
          );
        })}
      </div>

      {/* Jumbled Letters */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          maxWidth: '500px',
          margin: '0 auto',
        }}
      >
        {jumbled.map((tile) => (
          <motion.button
            type="button"
            key={tile.id}
            whileHover={!tile.isSelected && status === 'playing' ? { scale: 1.08 } : {}}
            whileTap={!tile.isSelected && status === 'playing' ? { scale: 0.92 } : {}}
            onClick={() => handleSelect(tile)}
            disabled={tile.isSelected || status !== 'playing'}
            style={{
              width: 'clamp(44px, 12vw, 60px)',
              height: 'clamp(44px, 12vw, 60px)',
              backgroundColor: tile.isSelected ? '#e0e0e0' : '#0ea5e9',
              border: 'none',
              borderRadius: '12px',
              fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
              fontWeight: 'bold',
              color: tile.isSelected ? '#9e9e9e' : 'white',
              cursor: tile.isSelected || status !== 'playing' ? 'default' : 'pointer',
              boxShadow: tile.isSelected ? 'none' : '0 4px 0 #0284c7',
              transform: tile.isSelected ? 'translateY(4px)' : 'none',
              transition: 'all 0.1s',
            }}
          >
            {tile.char}
          </motion.button>
        ))}
      </div>

      {status === 'playing' && (
        <button
          type="button"
          onClick={handleReset}
          style={{
            marginTop: '32px',
            padding: '10px 20px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 0 #b91c1c',
          }}
        >
          Reset Word
        </button>
      )}

      {status === 'correct' && (
        <div style={{ marginTop: '24px', fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', color: '#16a34a', fontWeight: 'bold' }}>
          Perfect! ✅
        </div>
      )}
      {status === 'wrong' && (
        <div style={{ marginTop: '24px', fontSize: 'clamp(1.1rem, 3.8vw, 1.5rem)', color: '#dc2626', fontWeight: 'bold' }}>
          Oops! Correct spelling: {targetWord} ❌
        </div>
      )}
    </div>
  );
}

export default WordScramble;
