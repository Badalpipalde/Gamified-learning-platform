import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function DragPuzzle({ question, onComplete, onFail }) {
  const [placed, setPlaced] = useState(false);
  
  // Very simple simulation of drag/drop by selecting the answer from a bank
  const options = question.options || [];

  const handleSelect = (opt) => {
    if (opt === question.answer) {
      setPlaced(true);
      setTimeout(() => onComplete(), 1000);
    } else {
      onFail();
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '40px' }}>
        {question.question.replace('___', placed ? `[ ${question.answer} ]` : '[ ? ]')}
      </h2>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        {options.map((opt, i) => (
          <motion.div
            key={i}
            onClick={() => handleSelect(opt)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '20px 40px',
              backgroundColor: 'var(--color-primary-bg)',
              border: '2px dashed var(--color-primary)',
              borderRadius: '8px',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'var(--color-primary)',
              cursor: 'pointer'
            }}
          >
            {opt}
          </motion.div>
        ))}
      </div>
      
      {placed && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{ marginTop: '40px', fontSize: '3rem' }}
        >
          ✅ Correct!
        </motion.div>
      )}
    </div>
  );
}

export default DragPuzzle;
