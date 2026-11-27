import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

function DragPuzzle({ question, onComplete, onFail }) {
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [status, setStatus] = useState(null); // null | 'correct' | 'wrong'
  const [isDragOver, setIsDragOver] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const options = question.options || [];
  const hasBlank = typeof question.question === 'string' && question.question.includes('___');
  const parts = hasBlank ? question.question.split('___') : [question.question];

  const handleSelect = (opt) => {
    if (status !== null || !opt) return;

    setSelectedOpt(opt);
    setIsDragOver(false);

    if (opt === question.answer) {
      setStatus('correct');
      timerRef.current = setTimeout(() => {
        onComplete();
      }, 950);
    } else {
      setStatus('wrong');
      timerRef.current = setTimeout(() => {
        onFail();
      }, 950);
    }
  };

  const handleDragStart = (e, opt) => {
    if (status !== null) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', opt);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (status === null && !isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const opt = e.dataTransfer.getData('text/plain');
    handleSelect(opt);
  };

  const dropSlotStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '72px',
    minHeight: '46px',
    padding: '4px 14px',
    margin: '0 8px',
    borderRadius: '10px',
    border: `2px ${selectedOpt ? 'solid' : 'dashed'} ${
      status === 'correct'
        ? 'var(--color-success)'
        : status === 'wrong'
        ? 'var(--color-danger)'
        : isDragOver
        ? 'var(--color-primary)'
        : 'var(--color-primary-light)'
    }`,
    backgroundColor:
      status === 'correct'
        ? 'var(--color-success-bg)'
        : status === 'wrong'
        ? 'var(--color-danger-bg)'
        : isDragOver
        ? 'var(--color-primary-bg)'
        : 'var(--color-surface-raised)',
    color:
      status === 'correct'
        ? 'var(--color-success)'
        : status === 'wrong'
        ? 'var(--color-danger)'
        : 'var(--color-primary)',
    fontWeight: 'bold',
    verticalAlign: 'middle',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={{ textAlign: 'center', padding: 'clamp(12px, 3vw, 24px)', maxWidth: '720px', margin: '0 auto' }}>
      <h2
        style={{
          fontSize: 'clamp(1.25rem, 4.5vw, 2rem)',
          marginBottom: '16px',
          lineHeight: 1.5,
          color: 'var(--color-text)',
        }}
      >
        {hasBlank ? (
          <>
            <span>{parts[0]}</span>
            <span
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={dropSlotStyle}
            >
              {selectedOpt ?? '?'}
            </span>
            <span>{parts.slice(1).join('___')}</span>
          </>
        ) : (
          <span>{question.question}</span>
        )}
      </h2>

      {!hasBlank && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            ...dropSlotStyle,
            minWidth: '180px',
            margin: '8px auto 24px',
            fontSize: '1.1rem',
          }}
        >
          {selectedOpt ?? (isDragOver ? 'Release here' : 'Drop answer here')}
        </div>
      )}

      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)',
          marginBottom: '24px',
        }}
      >
        Drag the correct answer into the box or tap a tile below.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '12px',
          maxWidth: '540px',
          margin: '0 auto',
        }}
      >
        {options.map((opt, i) => {
          const isChosen = selectedOpt === opt;
          const tileBg =
            isChosen && status === 'correct'
              ? 'var(--color-success)'
              : isChosen && status === 'wrong'
              ? 'var(--color-danger)'
              : 'var(--color-primary-bg)';
          const tileColor = isChosen ? '#fff' : 'var(--color-primary)';
          const tileBorder =
            isChosen && status === 'correct'
              ? 'var(--color-success)'
              : isChosen && status === 'wrong'
              ? 'var(--color-danger)'
              : 'var(--color-primary)';

          return (
            <motion.button
              type="button"
              key={i}
              draggable={status === null}
              onDragStart={(e) => handleDragStart(e, opt)}
              onClick={() => handleSelect(opt)}
              disabled={status !== null}
              whileHover={status === null ? { scale: 1.04 } : {}}
              whileTap={status === null ? { scale: 0.96 } : {}}
              style={{
                padding: '14px 16px',
                minHeight: '54px',
                backgroundColor: tileBg,
                border: `2px dashed ${tileBorder}`,
                borderRadius: '12px',
                fontSize: 'clamp(1.05rem, 3.5vw, 1.35rem)',
                fontWeight: 'bold',
                color: tileColor,
                cursor: status !== null ? 'default' : 'grab',
                opacity: status !== null && !isChosen ? 0.55 : 1,
                transition: 'background-color 0.2s, color 0.2s, opacity 0.2s',
              }}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>

      <div style={{ minHeight: '40px', marginTop: '24px' }}>
        {status === 'correct' && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ fontSize: 'clamp(1.3rem, 4vw, 2rem)', fontWeight: 'bold', color: 'var(--color-success)' }}
          >
            ✅ Correct!
          </motion.div>
        )}
        {status === 'wrong' && (
          <motion.div
            initial={{ x: -8, opacity: 0 }}
            animate={{ x: [0, -6, 6, -4, 4, 0], opacity: 1 }}
            transition={{ duration: 0.35 }}
            style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.5rem)', fontWeight: 'bold', color: 'var(--color-danger)' }}
          >
            ❌ Wrong! Correct answer: {question.answer}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default DragPuzzle;
