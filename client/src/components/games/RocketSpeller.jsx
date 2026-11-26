import { useState, useEffect, useRef } from 'react';

function RocketSpeller({ question, onComplete, onFail }) {
  const targetWord = (question.answer || "APPLE").toUpperCase();
  const [renderTrigger, setRenderTrigger] = useState(0);
  
  const state = useRef({
    rocketX: 50,
    bullets: [],
    asteroids: [],
    spelled: "",
    keys: { left: false, right: false, space: false },
    lastShot: 0,
    gameOver: false,
    frameId: null
  });

  // Initialization
  useEffect(() => {
    state.current.spelled = "";
    state.current.bullets = [];
    state.current.gameOver = false;
    
    const letters = targetWord.split('');
    const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
    const spawnList = [...letters];
    // add some random noise
    for(let i=0; i<2; i++) {
      spawnList.push(randomChars[Math.floor(Math.random() * randomChars.length)]);
    }
    spawnList.sort(() => Math.random() - 0.5);

    state.current.asteroids = spawnList.map((char, i) => ({
      id: Math.random().toString(),
      char,
      x: Math.random() * 80 + 10,
      y: -20 - (i * 30), 
      speed: Math.random() * 0.1 + 0.05 // slower falling
    }));
  }, [question, targetWord]);

  // Game Loop
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'ArrowLeft') state.current.keys.left = true;
      if (e.code === 'ArrowRight') state.current.keys.right = true;
      if (e.code === 'Space') state.current.keys.space = true;
    };
    const handleKeyUp = (e) => {
      if (e.code === 'ArrowLeft') state.current.keys.left = false;
      if (e.code === 'ArrowRight') state.current.keys.right = false;
      if (e.code === 'Space') state.current.keys.space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const loop = (time) => {
      if (state.current.gameOver) return;

      const s = state.current;
      
      // Move Rocket
      if (s.keys.left && s.rocketX > 5) s.rocketX -= 1;
      if (s.keys.right && s.rocketX < 95) s.rocketX += 1;

      // Shoot Bullet (rate limit to 1 per 300ms)
      if (s.keys.space && time - s.lastShot > 300) {
        s.bullets.push({ id: Math.random().toString(), x: s.rocketX, y: 90 });
        s.lastShot = time;
      }

      // Move Bullets
      s.bullets.forEach(b => b.y -= 1.5);
      s.bullets = s.bullets.filter(b => b.y > -10);

      // Move Asteroids
      s.asteroids.forEach(a => {
        a.y += a.speed;
        if (a.y > 110) {
          a.y = -20; // reset to top if missed
          a.x = Math.random() * 80 + 10;
        }
      });

      // Collision Detection
      for (let i = s.bullets.length - 1; i >= 0; i--) {
        const b = s.bullets[i];
        for (let j = s.asteroids.length - 1; j >= 0; j--) {
          const a = s.asteroids[j];
          // Simple distance check (percentages)
          if (Math.abs(b.x - a.x) < 5 && Math.abs(b.y - a.y) < 5) {
            // Hit!
            const hitChar = a.char;
            s.bullets.splice(i, 1);
            s.asteroids.splice(j, 1);
            
            const newSpelled = s.spelled + hitChar;
            if (targetWord.startsWith(newSpelled)) {
              s.spelled = newSpelled;
              if (newSpelled === targetWord) {
                s.gameOver = true;
                setTimeout(onComplete, 1000);
              }
            } else {
              s.spelled = ""; // reset
            }
            break;
          }
        }
      }

      setRenderTrigger(prev => prev + 1); // trigger re-render
      s.frameId = requestAnimationFrame(loop);
    };

    state.current.frameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(state.current.frameId);
    };
  }, [targetWord, onComplete]);

  const s = state.current;

  const fireBullet = () => {
    const now = performance.now();
    if (!s.gameOver && now - s.lastShot > 250) {
      s.bullets.push({ id: Math.random().toString(), x: s.rocketX, y: 86 });
      s.lastShot = now;
    }
  };

  return (
    <div>
      <div style={{ position: 'relative', height: 'clamp(360px, 60dvh, 540px)', backgroundColor: '#0b0f19', borderRadius: '16px', overflow: 'hidden', padding: '16px', touchAction: 'none' }}>
        <div style={{ color: 'white', textAlign: 'center', zIndex: 10, position: 'relative' }}>
          <h2 style={{ fontSize: 'clamp(1.05rem, 3.5vw, 1.5rem)', marginBottom: '8px', color: 'white' }}>{question.question}</h2>
          <div style={{ fontSize: 'clamp(1.3rem, 5vw, 2rem)', letterSpacing: '4px', borderBottom: '2px solid white', display: 'inline-block', padding: '0 14px', minHeight: '36px', fontWeight: 'bold' }}>
            {s.spelled.padEnd(targetWord.length, '_')}
          </div>
          <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: '0.8rem' }}>Use Arrows + Space or the touch controls below!</p>
        </div>

      {/* Render Asteroids */}
      {s.asteroids.map(a => (
        <div
          key={a.id}
          style={{
            position: 'absolute',
            left: `${a.x}%`,
            top: `${a.y}%`,
            width: '40px',
            height: '40px',
            backgroundColor: '#607d8b',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            boxShadow: 'inset -3px -3px 8px rgba(0,0,0,0.5)',
            transform: 'translate(-50%, -50%)'
          }}
        >
          {a.char}
        </div>
      ))}

      {/* Render Bullets */}
      {s.bullets.map(b => (
        <div
          key={b.id}
          style={{
            position: 'absolute',
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: '4px',
            height: '15px',
            backgroundColor: '#ffeb3b',
            borderRadius: '2px',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 8px #ffeb3b'
          }}
        />
      ))}

      {/* Render Rocket */}
      <div style={{
        position: 'absolute',
        top: '90%',
        left: `${s.rocketX}%`,
        transform: 'translate(-50%, -50%) rotate(-45deg)',
        fontSize: '2rem',
        filter: 'drop-shadow(0 0 10px rgba(255,152,0,0.5))'
      }}>
        🚀
      </div>
      
      {s.gameOver && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'clamp(1.8rem, 6vw, 3rem)',
          fontWeight: 'bold',
          color: '#4caf50',
          zIndex: 20
        }}>
          Success!
        </div>
      )}
      </div>
      {/* Touch Controls for Mobile */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '12px', touchAction: 'manipulation' }}>
        <button
          type="button"
          className="btn btn-outline"
          onPointerDown={() => { s.keys.left = true; }}
          onPointerUp={() => { s.keys.left = false; }}
          onPointerLeave={() => { s.keys.left = false; }}
          aria-label="Move Left"
        >
          ◀ Left
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={fireBullet}
        >
          🚀 Fire
        </button>
        <button
          type="button"
          className="btn btn-outline"
          onPointerDown={() => { s.keys.right = true; }}
          onPointerUp={() => { s.keys.right = false; }}
          onPointerLeave={() => { s.keys.right = false; }}
          aria-label="Move Right"
        >
          Right ▶
        </button>
      </div>
    </div>
  );
}
export default RocketSpeller;
