import { useState, useEffect, useRef } from 'react';

function buildBlocks(question) {
  if (!question || !Array.isArray(question.options) || question.options.length === 0) {
    return [];
  }
  const count = question.options.length;
  const lanes = Array.from({ length: count }, (_, idx) => {
    const margin = 14;
    const span = 100 - margin * 2;
    return count === 1 ? 50 : margin + (idx * span) / (count - 1);
  }).sort(() => Math.random() - 0.5);

  return question.options.map((opt, i) => ({
    id: i,
    text: opt,
    isCorrect: opt === question.answer,
    x: lanes[i] + (Math.random() * 6 - 3),
    y: -12 - i * 24,
    speed: 18 + Math.random() * 6,
    active: true,
  }));
}

function MathRunner({ question, onComplete, onFail }) {
  const containerRef = useRef(null);
  const requestRef = useRef(null);
  const lastTimeRef = useRef(null);
  const timerRef = useRef(null);

  const playerXRef = useRef(50);
  const [initialBlocks] = useState(() => buildBlocks(question));
  const blocksRef = useRef(initialBlocks);
  const resolvedRef = useRef(false);
  const keysRef = useRef({ left: false, right: false });

  const [playerX, setPlayerX] = useState(50);
  const [renderBlocks, setRenderBlocks] = useState(initialBlocks);
  const [feedback, setFeedback] = useState(null); // { type: 'correct' | 'wrong', text: string }

  // Keyboard support (Left / Right / A / D)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = true;
    };
    const onKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Main delta-time game loop (never restarts on playerX changes, never calls callbacks in state updaters)
  useEffect(() => {
    const finishRound = (isCorrect, message) => {
      if (resolvedRef.current) return;
      resolvedRef.current = true;
      setFeedback({ type: isCorrect ? 'correct' : 'wrong', text: message });
      timerRef.current = setTimeout(() => {
        if (isCorrect) {
          onComplete();
        } else {
          onFail();
        }
      }, 850);
    };

    const tick = (timestamp) => {
      if (resolvedRef.current) return;

      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;

      // Apply keyboard movement smoothly
      if (keysRef.current.left || keysRef.current.right) {
        let nextX = playerXRef.current;
        if (keysRef.current.left) nextX -= 65 * dt;
        if (keysRef.current.right) nextX += 65 * dt;
        nextX = Math.max(6, Math.min(94, nextX));
        playerXRef.current = nextX;
        setPlayerX(nextX);
      }

      const blocks = blocksRef.current;
      if (blocks.length > 0) {
        let caughtBlock = null;
        let correctBlockMissed = false;

        const updated = blocks.map((block) => {
          if (!block.active) return block;

          const newY = block.y + block.speed * dt;

          // Block visual center is roughly newY + 6%; runner catch zone is y ~ 76%..93%
          if (newY + 8 >= 78 && newY <= 92 && Math.abs(block.x - playerXRef.current) < 11) {
            caughtBlock = block;
            return { ...block, y: newY, active: false };
          }

          if (newY > 100) {
            if (block.isCorrect) {
              correctBlockMissed = true;
            }
            return { ...block, y: newY, active: false };
          }

          return { ...block, y: newY };
        });

        blocksRef.current = updated;
        setRenderBlocks(updated);

        if (caughtBlock) {
          if (caughtBlock.isCorrect) {
            finishRound(true, `✅ Caught ${caughtBlock.text}!`);
          } else {
            finishRound(false, `❌ Caught ${caughtBlock.text} — Answer was ${question.answer}`);
          }
          return;
        }

        if (correctBlockMissed || updated.every((b) => !b.active)) {
          finishRound(false, `⏰ Missed! Answer was ${question.answer}`);
          return;
        }
      }

      requestRef.current = requestAnimationFrame(tick);
    };

    requestRef.current = requestAnimationFrame(tick);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [question, onComplete, onFail]);

  const movePlayerToClientX = (clientX) => {
    if (resolvedRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let percentage = ((clientX - rect.left) / rect.width) * 100;
    percentage = Math.max(6, Math.min(94, percentage));
    playerXRef.current = percentage;
    setPlayerX(percentage);
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      movePlayerToClientX(e.touches[0].clientX);
    }
  };

  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      movePlayerToClientX(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    movePlayerToClientX(e.clientX);
  };

  return (
    <div
      className="math-runner-container"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        height: 'clamp(360px, 60dvh, 520px)',
        background: 'linear-gradient(to bottom, #1e3c72, #2a5298)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        cursor: 'ew-resize',
        touchAction: 'none',
        userSelect: 'none',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
      }}
    >
      {/* Target Question Display */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.95)',
          padding: '8px 18px',
          borderRadius: '30px',
          fontSize: 'clamp(1.15rem, 4.5vw, 1.8rem)',
          fontWeight: 'bold',
          color: '#0f172a',
          maxWidth: '90%',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          zIndex: 10,
        }}
      >
        {question?.question}
      </div>

      {/* Instructions */}
      <div
        style={{
          position: 'absolute',
          top: '76px',
          width: '100%',
          padding: '0 12px',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.7)',
          fontSize: 'clamp(0.8rem, 2.8vw, 1rem)',
          pointerEvents: 'none',
          fontWeight: 'bold',
        }}
      >
        ← Drag, move, or use Arrow keys →
        <br />
        Catch the correct answer!
      </div>

      {/* Falling Blocks */}
      {renderBlocks
        .filter((b) => b.active)
        .map((block) => (
          <div
            key={block.id}
            style={{
              position: 'absolute',
              left: `${block.x}%`,
              top: `${block.y}%`,
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
              border: '2px solid #fff',
              borderRadius: '12px',
              minWidth: '54px',
              height: '54px',
              padding: '0 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(1.1rem, 4vw, 1.45rem)',
              fontWeight: 'bold',
              color: '#0f172a',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
              pointerEvents: 'none',
            }}
          >
            {block.text}
          </div>
        ))}

      {/* Catch / Miss Feedback Overlay */}
      {feedback && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 20,
          }}
        >
          <div
            style={{
              background: feedback.type === 'correct' ? '#10b981' : '#ef4444',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '999px',
              fontWeight: 'bold',
              fontSize: 'clamp(1rem, 3.8vw, 1.35rem)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
              textAlign: 'center',
            }}
          >
            {feedback.text}
          </div>
        </div>
      )}

      {/* Player Character */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: `${playerX}%`,
          transform: 'translateX(-50%)',
          fontSize: 'clamp(2.4rem, 7vw, 3rem)',
          filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.4))',
          pointerEvents: 'none',
        }}
      >
        🏃‍♂️
      </div>

      {/* Ground */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '20px',
          background: '#4caf50',
          borderTop: '4px solid #388e3c',
        }}
      />
    </div>
  );
}

export default MathRunner;
