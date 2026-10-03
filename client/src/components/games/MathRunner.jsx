import { useState, useEffect, useRef } from 'react';

function MathRunner({ question, onComplete, onFail }) {
  // question: { question: "12 + 8", answer: "20", options: ["18", "20", "22", "24"] }
  
  const containerRef = useRef(null);
  const requestRef = useRef();
  
  const [playerX, setPlayerX] = useState(50); // percentage 0-100
  const [fallingBlocks, setFallingBlocks] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  // Initialize falling blocks based on options
  useEffect(() => {
    if (!question || !question.options) return;
    
    // Create a block for each option with random X positions
    const blocks = question.options.map((opt, i) => ({
      id: i,
      text: opt,
      isCorrect: opt === question.answer,
      x: 10 + (Math.random() * 80), // random % between 10-90
      y: -20 - (i * 30), // staggered starting heights
      speed: 0.1 + (Math.random() * 0.1), // significantly slower for easier gameplay on mobile
      active: true
    }));
    
    setFallingBlocks(blocks);
    setGameOver(false);
  }, [question]);

  // Main game loop
  const updateGame = () => {
    if (gameOver) return;

    setFallingBlocks(prev => {
      let activeBlocks = [...prev];
      let hasHit = false;

      activeBlocks = activeBlocks.map(block => {
        if (!block.active) return block;

        const newY = block.y + block.speed;

        // Collision detection (approximate)
        // Player is at bottom (y ~ 90), width ~ 10%
        if (newY > 85 && newY < 95) {
          if (Math.abs(block.x - playerX) < 10) {
            // Collision!
            hasHit = true;
            if (block.isCorrect) {
              onComplete();
            } else {
              onFail();
            }
            return { ...block, active: false };
          }
        }

        // Missed block
        if (newY > 100) {
          return { ...block, active: false };
        }

        return { ...block, y: newY };
      });

      // If all blocks missed and no hit, fail
      if (!hasHit && activeBlocks.every(b => !b.active)) {
        onFail();
      }

      return activeBlocks;
    });

    requestRef.current = requestAnimationFrame(updateGame);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(requestRef.current);
  }, [playerX, gameOver]); // rebind when player moves

  // Controls
  const handleTouchMove = (e) => {
    if (gameOver) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    let percentage = (touchX / rect.width) * 100;
    percentage = Math.max(5, Math.min(95, percentage));
    setPlayerX(percentage);
  };

  const handleMouseMove = (e) => {
    if (gameOver) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    let percentage = (mouseX / rect.width) * 100;
    percentage = Math.max(5, Math.min(95, percentage));
    setPlayerX(percentage);
  };

  return (
    <div 
      className="math-runner-container" 
      ref={containerRef}
      onTouchMove={handleTouchMove}
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        height: 'calc(100vh - 200px)',
        minHeight: '300px',
        background: 'linear-gradient(to bottom, #1e3c72, #2a5298)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        cursor: 'ew-resize',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
      }}
    >
      {/* Target Question Display */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255,255,255,0.9)',
        padding: '10px 20px',
        borderRadius: '30px',
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#333',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        zIndex: 10
      }}>
        {question?.question}
      </div>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        top: '100px',
        width: '100%',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.6)',
        fontSize: '1.2rem',
        pointerEvents: 'none',
        fontWeight: 'bold'
      }}>
        ← Drag to move left / right →<br/>
        Catch the correct answer!
      </div>

      {/* Falling Blocks */}
      {fallingBlocks.filter(b => b.active).map(block => (
        <div 
          key={block.id}
          style={{
            position: 'absolute',
            left: `${block.x}%`,
            top: `${block.y}%`,
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
            border: '2px solid #fff',
            borderRadius: '12px',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#333',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}
        >
          {block.text}
        </div>
      ))}

      {/* Player Character */}
      <div 
        style={{
          position: 'absolute',
          bottom: '20px',
          left: `${playerX}%`,
          transform: 'translateX(-50%)',
          fontSize: '3rem',
          filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.4))',
          transition: 'left 0.1s ease-out'
        }}
      >
        🏃‍♂️
      </div>

      {/* Ground */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '20px',
        background: '#4caf50',
        borderTop: '4px solid #388e3c'
      }}></div>
    </div>
  );
}

export default MathRunner;
