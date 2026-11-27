import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const BUBBLE_COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#14b8a6', '#ef4444'];

function buildBubbles(question) {
  const options = question?.options || [];
  const count = options.length;
  return options.map((opt, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const xBase = count === 1 ? 42 : col === 0 ? 14 : 56;
    const yBase = 16 + row * 24;
    return {
      id: i,
      text: opt,
      x: xBase + (Math.random() * 8 - 4),
      y: yBase + (Math.random() * 6 - 3),
      driftY: -12 - Math.random() * 10,
      driftX: (i % 2 === 0 ? 1 : -1) * (6 + Math.random() * 8),
      speed: 2.6 + Math.random() * 1.4,
      color: BUBBLE_COLORS[i % BUBBLE_COLORS.length],
    };
  });
}

function BubblePop({ question, onComplete, onFail }) {
  const [bubbles] = useState(() => buildBubbles(question));
  const [status, setStatus] = useState(null); // null | { isCorrect: boolean, chosen: string }
  const containerRef = useRef(null);
  const dropZoneRef = useRef(null);
  const submittedRef = useRef(false);

  const submitAnswer = (text) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const isCorrect = text === question.answer;
    setStatus({ isCorrect, chosen: text });
    if (isCorrect) {
      onComplete();
    } else {
      onFail();
    }
  };

  const handleDragEnd = (_event, info, text) => {
    if (submittedRef.current || !dropZoneRef.current) return;

    // Convert Framer Motion page point into viewport coordinates to match getBoundingClientRect()
    const dropBounds = dropZoneRef.current.getBoundingClientRect();
    const clientX = info.point.x - window.scrollX;
    const clientY = info.point.y - window.scrollY;

    if (
      clientX >= dropBounds.left &&
      clientX <= dropBounds.right &&
      clientY >= dropBounds.top &&
      clientY <= dropBounds.bottom
    ) {
      submitAnswer(text);
    }
  };

  // Clear selection state helper if needed on remount
  useEffect(() => {
    submittedRef.current = false;
  }, [question]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        height: 'clamp(360px, 62dvh, 520px)',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#1a1a1a',
        borderRadius: '16px',
        overflow: 'hidden',
        color: 'white',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        touchAction: 'none',
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          color: '#ddd',
          fontSize: 'clamp(1.1rem, 4vw, 1.7rem)',
          zIndex: 10,
          position: 'relative',
        }}
      >
        {question.question}
      </h2>
      <p
        style={{
          textAlign: 'center',
          color: '#aaa',
          fontSize: '0.85rem',
          zIndex: 10,
          position: 'relative',
          marginTop: '4px',
        }}
      >
        Drag the correct bubble into the Drop Zone, or tap a bubble!
      </p>

      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '86%',
          height: '84px',
          border: `3px dashed ${
            status ? (status.isCorrect ? '#22c55e' : '#ef4444') : '#4caf50'
          }`,
          borderRadius: '16px',
          backgroundColor: status
            ? status.isCorrect
              ? 'rgba(34, 197, 94, 0.2)'
              : 'rgba(239, 68, 68, 0.2)'
            : 'rgba(76, 175, 80, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'clamp(1rem, 3.5vw, 1.35rem)',
          fontWeight: 'bold',
          color: status ? (status.isCorrect ? '#4ade80' : '#f87171') : '#4caf50',
          zIndex: 5,
          textAlign: 'center',
          padding: '0 12px',
        }}
      >
        {status
          ? status.isCorrect
            ? `✅ Pop! ${status.chosen} is correct!`
            : `❌ ${status.chosen} — Answer: ${question.answer}`
          : 'Drop Answer Here'}
      </div>

      {bubbles.map((bubble) => {
        const isChosen = status?.chosen === bubble.text;
        return (
          <motion.div
            key={bubble.id}
            drag={status === null}
            dragConstraints={containerRef}
            dragSnapToOrigin
            whileDrag={{ scale: 1.15, cursor: 'grabbing', zIndex: 50 }}
            onDragEnd={(e, info) => handleDragEnd(e, info, bubble.text)}
            onClick={() => submitAnswer(bubble.text)}
            animate={
              status
                ? { y: 0, x: 0, opacity: isChosen ? 1 : 0.45 }
                : { y: [0, bubble.driftY, 0], x: [0, bubble.driftX, 0] }
            }
            transition={{
              duration: bubble.speed,
              repeat: status ? 0 : Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: 'clamp(74px, 18vw, 102px)',
              height: 'clamp(74px, 18vw, 102px)',
              backgroundColor: bubble.color,
              border: isChosen ? '3px solid #fff' : 'none',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '6px',
              fontWeight: 'bold',
              fontSize: 'clamp(0.8rem, 2.8vw, 1.1rem)',
              cursor: status ? 'default' : 'grab',
              touchAction: 'none',
              boxShadow: 'inset -10px -10px 20px rgba(0,0,0,0.3), 0 5px 15px rgba(0,0,0,0.4)',
              color: '#fff',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              zIndex: isChosen ? 20 : 10,
              wordBreak: 'break-word',
            }}
            whileHover={status ? {} : { scale: 1.08 }}
            whileTap={status ? {} : { scale: 0.92, cursor: 'grabbing' }}
          >
            {bubble.text}
          </motion.div>
        );
      })}
    </div>
  );
}

export default BubblePop;