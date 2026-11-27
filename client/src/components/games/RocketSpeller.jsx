import { useState, useEffect, useRef } from 'react';

function buildAsteroids(targetWord) {
  const letters = targetWord.split('');
  const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const spawnList = [...letters];
  for (let i = 0; i < 2; i++) {
    spawnList.push(randomChars[Math.floor(Math.random() * randomChars.length)]);
  }
  spawnList.sort(() => Math.random() - 0.5);

  return spawnList.map((char, i) => ({
    id: `${i}-${char}`,
    char,
    x: 12 + ((i * 76) / Math.max(1, spawnList.length - 1)),
    y: -14 - i * 18,
    speed: 12 + Math.random() * 5,
  }));
}

function RocketSpeller({ question, onComplete }) {
  const targetWord = (question.answer || 'APPLE').toUpperCase();

  const [view, setView] = useState(() => ({
    rocketX: 50,
    bullets: [],
    asteroids: buildAsteroids(targetWord),
    spelled: '',
    gameOver: false,
  }));

  const gameRef = useRef({
    rocketX: 50,
    bullets: [],
    asteroids: view.asteroids,
    spelled: '',
    keys: { left: false, right: false, space: false },
    lastShot: 0,
    gameOver: false,
  });
  const timerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      if (e.code === 'ArrowLeft') gameRef.current.keys.left = true;
      if (e.code === 'ArrowRight') gameRef.current.keys.right = true;
      if (e.code === 'Space') gameRef.current.keys.space = true;
    };
    const handleKeyUp = (e) => {
      if (e.code === 'ArrowLeft') gameRef.current.keys.left = false;
      if (e.code === 'ArrowRight') gameRef.current.keys.right = false;
      if (e.code === 'Space') gameRef.current.keys.space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let lastTime = null;
    let frameId = null;

    const loop = (time) => {
      const s = gameRef.current;
      if (s.gameOver) return;

      if (lastTime === null) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      if (s.keys.left && s.rocketX > 6) s.rocketX = Math.max(6, s.rocketX - 60 * dt);
      if (s.keys.right && s.rocketX < 94) s.rocketX = Math.min(94, s.rocketX + 60 * dt);

      if (s.keys.space && time - s.lastShot > 280) {
        s.bullets.push({ id: `${time}-${Math.random()}`, x: s.rocketX, y: 86 });
        s.lastShot = time;
      }

      s.bullets.forEach((b) => {
        b.y -= 90 * dt;
      });
      s.bullets = s.bullets.filter((b) => b.y > -5);

      s.asteroids.forEach((a) => {
        a.y += a.speed * dt;
        if (a.y > 106) {
          a.y = -15;
          a.x = Math.random() * 80 + 10;
        }
      });

      for (let i = s.bullets.length - 1; i >= 0; i--) {
        const b = s.bullets[i];
        for (let j = s.asteroids.length - 1; j >= 0; j--) {
          const a = s.asteroids[j];
          if (Math.abs(b.x - a.x) < 6 && Math.abs(b.y - a.y) < 6) {
            const hitChar = a.char;
            s.bullets.splice(i, 1);
            s.asteroids.splice(j, 1);

            const newSpelled = s.spelled + hitChar;
            if (targetWord.startsWith(newSpelled)) {
              s.spelled = newSpelled;
              if (newSpelled === targetWord) {
                s.gameOver = true;
                timerRef.current = setTimeout(onComplete, 900);
              }
            } else {
              s.spelled = '';
            }
            break;
          }
        }
      }

      setView({
        rocketX: s.rocketX,
        bullets: [...s.bullets],
        asteroids: [...s.asteroids],
        spelled: s.spelled,
        gameOver: s.gameOver,
      });

      if (!s.gameOver) {
        frameId = requestAnimationFrame(loop);
      }
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (frameId) cancelAnimationFrame(frameId);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [targetWord, onComplete]);

  const fireBullet = () => {
    const s = gameRef.current;
    const now = performance.now();
    if (!s.gameOver && now - s.lastShot > 240) {
      s.bullets.push({ id: `${now}-${Math.random()}`, x: s.rocketX, y: 86 });
      s.lastShot = now;
    }
  };

  return (
    <div>
      <div
        style={{
          position: 'relative',
          height: 'clamp(360px, 60dvh, 540px)',
          backgroundColor: '#0b0f19',
          borderRadius: '16px',
          overflow: 'hidden',
          padding: '16px',
          touchAction: 'none',
        }}
      >
        <div style={{ color: 'white', textAlign: 'center', zIndex: 10, position: 'relative' }}>
          <h2 style={{ fontSize: 'clamp(1.05rem, 3.5vw, 1.5rem)', marginBottom: '8px', color: 'white' }}>
            {question.question}
          </h2>
          <div
            style={{
              fontSize: 'clamp(1.3rem, 5vw, 2rem)',
              letterSpacing: '4px',
              borderBottom: '2px solid white',
              display: 'inline-block',
              padding: '0 14px',
              minHeight: '36px',
              fontWeight: 'bold',
            }}
          >
            {view.spelled.padEnd(targetWord.length, '_')}
          </div>
          <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: '0.8rem' }}>
            Use Arrows + Space or the touch controls below!
          </p>
        </div>

        {/* Render Asteroids */}
        {view.asteroids.map((a) => (
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
              transform: 'translate(-50%, -50%)',
            }}
          >
            {a.char}
          </div>
        ))}

        {/* Render Bullets */}
        {view.bullets.map((b) => (
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
              boxShadow: '0 0 8px #ffeb3b',
            }}
          />
        ))}

        {/* Render Rocket */}
        <div
          style={{
            position: 'absolute',
            top: '90%',
            left: `${view.rocketX}%`,
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            fontSize: '2rem',
            filter: 'drop-shadow(0 0 10px rgba(255,152,0,0.5))',
          }}
        >
          🚀
        </div>

        {view.gameOver && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(1.8rem, 6vw, 3rem)',
              fontWeight: 'bold',
              color: '#4caf50',
              zIndex: 20,
            }}
          >
            Success!
          </div>
        )}
      </div>

      {/* Touch Controls for Mobile */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '12px', touchAction: 'manipulation' }}>
        <button
          type="button"
          className="btn btn-outline"
          onPointerDown={() => {
            gameRef.current.keys.left = true;
          }}
          onPointerUp={() => {
            gameRef.current.keys.left = false;
          }}
          onPointerLeave={() => {
            gameRef.current.keys.left = false;
          }}
          aria-label="Move Left"
        >
          ◀ Left
        </button>
        <button type="button" className="btn btn-primary" onClick={fireBullet}>
          🚀 Fire
        </button>
        <button
          type="button"
          className="btn btn-outline"
          onPointerDown={() => {
            gameRef.current.keys.right = true;
          }}
          onPointerUp={() => {
            gameRef.current.keys.right = false;
          }}
          onPointerLeave={() => {
            gameRef.current.keys.right = false;
          }}
          aria-label="Move Right"
        >
          Right ▶
        </button>
      </div>
    </div>
  );
}

export default RocketSpeller;
