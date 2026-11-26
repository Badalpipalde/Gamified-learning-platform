import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

function VirtualLab({ question, onComplete, onFail }) {
  const [inFlask, setInFlask] = useState([]);
  const [reaction, setReaction] = useState(null); // null | 'success' | 'explosion'
  const [isDragOver, setIsDragOver] = useState(false);
  const timerRef = useRef(null);

  // Clean up any active reaction timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const options =
    Array.isArray(question?.options) && question.options.length > 0
      ? question.options
      : [question?.answer || 'Water', 'Salt', 'Vinegar', 'Baking Soda'].filter(
          (v, i, arr) => arr.indexOf(v) === i
        );

  const handleDragStart = (e, item) => {
    if (reaction) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', item);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const testItem = (item) => {
    if (!item || reaction) return;
    setInFlask([item]);
    setIsDragOver(false);

    if (item === question.answer) {
      setReaction('success');
      timerRef.current = setTimeout(() => {
        onComplete();
      }, 1300);
    } else {
      setReaction('explosion');
      timerRef.current = setTimeout(() => {
        onFail();
      }, 1300);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const item = e.dataTransfer.getData('text/plain');
    testItem(item);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const liquidColor =
    reaction === 'success'
      ? 'linear-gradient(to top, #10b981, #6ee7b7)'
      : reaction === 'explosion'
      ? 'linear-gradient(to top, #ef4444, #fca5a5)'
      : isDragOver
      ? 'linear-gradient(to top, #3b82f6, #93c5fd)'
      : 'linear-gradient(to top, #60a5fa, #bfdbfe)';

  return (
    <div
      style={{
        padding: 'clamp(12px, 3vw, 24px)',
        textAlign: 'center',
        maxWidth: '720px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          borderRadius: '999px',
          background: 'var(--color-primary-bg)',
          color: 'var(--color-primary)',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '12px',
        }}
      >
        🧪 Virtual Chemistry Lab
      </div>

      <h2
        style={{
          fontSize: 'clamp(1.1rem, 3.8vw, 1.45rem)',
          marginBottom: '8px',
          color: 'var(--color-text)',
          lineHeight: 1.35,
        }}
      >
        {question?.question}
      </h2>
      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)',
          marginBottom: '20px',
        }}
      >
        Drag a reagent into the beaker below, or tap one to test the reaction.
      </p>

      {/* Workbench (Draggable & Tappable Reagent Bottles) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '10px',
          marginBottom: '28px',
        }}
      >
        {options.map((opt) => (
          <motion.button
            type="button"
            key={opt}
            draggable={!reaction}
            onDragStart={(e) => handleDragStart(e, opt)}
            onClick={() => testItem(opt)}
            disabled={!!reaction}
            whileHover={!reaction ? { y: -2 } : {}}
            whileTap={!reaction ? { scale: 0.96 } : {}}
            style={{
              padding: '12px 14px',
              minHeight: '48px',
              background:
                inFlask[0] === opt
                  ? reaction === 'success'
                    ? '#10b981'
                    : '#ef4444'
                  : 'var(--color-surface)',
              color: inFlask[0] === opt ? '#fff' : 'var(--color-text)',
              border: `2px solid ${
                inFlask[0] === opt
                  ? reaction === 'success'
                    ? '#059669'
                    : '#dc2626'
                  : 'var(--color-primary-light)'
              }`,
              borderRadius: '12px',
              cursor: reaction ? 'default' : 'grab',
              fontWeight: 600,
              fontSize: '0.95rem',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              opacity: reaction && inFlask[0] !== opt ? 0.55 : 1,
              transition: 'background-color 0.2s, border-color 0.2s, opacity 0.2s',
            }}
          >
            <span>⚗️</span>
            <span>{opt}</span>
          </motion.button>
        ))}
      </div>

      {/* The Beaker / Flask (Drop Target) */}
      <motion.div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        animate={
          reaction === 'explosion'
            ? { x: [0, -8, 8, -6, 6, 0] }
            : reaction === 'success'
            ? { scale: [1, 1.04, 1] }
            : {}
        }
        transition={{ duration: 0.45 }}
        style={{
          width: 'clamp(170px, 48vw, 220px)',
          height: 'clamp(180px, 48vw, 220px)',
          margin: '0 auto',
          border: `4px solid ${
            isDragOver
              ? 'var(--color-primary)'
              : reaction === 'success'
              ? '#10b981'
              : reaction === 'explosion'
              ? '#ef4444'
              : '#94a3b8'
          }`,
          borderTop: 'none',
          borderRadius: '0 0 46px 46px',
          background: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isDragOver
            ? '0 0 0 6px rgba(37, 99, 235, 0.15)'
            : 'inset 0 -8px 18px rgba(15, 23, 42, 0.06)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
      >
        {/* Flask Neck Lip */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            borderBottom: '2px dashed #cbd5e1',
          }}
        />

        {/* Animated Liquid Fill */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: inFlask.length > 0 ? '68%' : '26%',
            background: liquidColor,
            opacity: inFlask.length > 0 ? 0.85 : 0.45,
            transition: 'height 0.4s ease, background 0.3s ease',
            zIndex: 1,
          }}
        />

        {/* Flask Contents */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            padding: '14px 10px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {reaction === 'success' && <div style={{ fontSize: '2.4rem' }}>✨</div>}
          {reaction === 'explosion' && <div style={{ fontSize: '2.4rem' }}>💥</div>}

          {inFlask.length === 0 ? (
            <div style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>
              {isDragOver ? 'Release to mix!' : 'Drop reagent here'}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {inFlask.map((item, i) => (
                <span
                  key={i}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Reaction Result Feedback */}
      <div style={{ minHeight: '28px', marginTop: '14px' }}>
        {reaction === 'success' && (
          <div style={{ color: '#059669', fontWeight: 700, fontSize: '0.95rem' }}>
            ✅ {question?.reactionLabel || 'Perfect reaction!'}
          </div>
        )}
        {reaction === 'explosion' && (
          <div style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.95rem' }}>
            ❌ Unexpected reaction! Moving to next experiment...
          </div>
        )}
      </div>
    </div>
  );
}

export default VirtualLab;
