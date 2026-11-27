import { useState, useEffect, useRef } from 'react';

const GRID_SIZE = 10;

function spawnFoodAvoidingSnake(snake, char) {
  const occupied = new Set(snake.map((s) => `${s.x},${s.y}`));
  const freeCells = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (!occupied.has(`${x},${y}`)) {
        freeCells.push({ x, y });
      }
    }
  }
  const pick =
    freeCells.length > 0
      ? freeCells[Math.floor(Math.random() * freeCells.length)]
      : { x: 0, y: 0 };
  return { x: pick.x, y: pick.y, char };
}

function SnakeSpeller({ question, onComplete, onFail }) {
  const targetWord = (question.answer || 'APPLE').toUpperCase();
  const initialSnake = [{ x: 5, y: 5 }];

  const [spelled, setSpelled] = useState('');
  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState(() => spawnFoodAvoidingSnake(initialSnake, targetWord[0]));
  const [gameOver, setGameOver] = useState(false);

  const stateRef = useRef({
    snake: initialSnake,
    dir: { x: 0, y: -1 },
    lastMovedDir: { x: 0, y: -1 },
    spelled: '',
    food: null,
    gameOver: false,
  });
  const timerRef = useRef(null);

  useEffect(() => {
    stateRef.current.food = food;
  }, [food]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      const lastDir = stateRef.current.lastMovedDir;
      if (e.key === 'ArrowUp' && lastDir.y !== 1) stateRef.current.dir = { x: 0, y: -1 };
      if (e.key === 'ArrowDown' && lastDir.y !== -1) stateRef.current.dir = { x: 0, y: 1 };
      if (e.key === 'ArrowLeft' && lastDir.x !== 1) stateRef.current.dir = { x: -1, y: 0 };
      if (e.key === 'ArrowRight' && lastDir.x !== -1) stateRef.current.dir = { x: 1, y: 0 };
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const s = stateRef.current;
      if (s.gameOver) return;

      const currentDir = s.dir;
      s.lastMovedDir = currentDir;

      const newHead = { x: s.snake[0].x + currentDir.x, y: s.snake[0].y + currentDir.y };

      const hitWall =
        newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE;

      const currentFood = s.food;
      const willEat = currentFood && newHead.x === currentFood.x && newHead.y === currentFood.y;
      const bodyToCheck = willEat ? s.snake : s.snake.slice(0, -1);
      const hitSelf = bodyToCheck.some((seg) => seg.x === newHead.x && seg.y === newHead.y);

      if (hitWall || hitSelf) {
        s.gameOver = true;
        setGameOver(true);
        timerRef.current = setTimeout(onFail, 1000);
        return;
      }

      const newSnake = [newHead, ...s.snake];

      if (willEat) {
        const newSpelled = s.spelled + currentFood.char;
        s.spelled = newSpelled;
        setSpelled(newSpelled);

        if (newSpelled === targetWord) {
          s.snake = newSnake;
          setSnake(newSnake);
          s.gameOver = true;
          setGameOver(true);
          timerRef.current = setTimeout(onComplete, 1000);
          return;
        }

        const nextFood = spawnFoodAvoidingSnake(newSnake, targetWord[newSpelled.length]);
        s.food = nextFood;
        setFood(nextFood);
      } else {
        newSnake.pop();
      }

      s.snake = newSnake;
      setSnake(newSnake);
    }, 340);

    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [targetWord, onComplete, onFail]);

  const changeDir = (nx, ny) => {
    if (stateRef.current.gameOver) return;
    const lastDir = stateRef.current.lastMovedDir;
    if (nx !== 0 && lastDir.x !== -nx) stateRef.current.dir = { x: nx, y: 0 };
    if (ny !== 0 && lastDir.y !== -ny) stateRef.current.dir = { x: 0, y: ny };
  };

  return (
    <div style={{ textAlign: 'center', padding: '10px' }}>
      <h2 style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.4rem)', marginBottom: '10px', color: 'var(--color-text)' }}>
        {question.question}
      </h2>
      <div style={{ fontSize: 'clamp(1.3rem, 5vw, 1.8rem)', marginBottom: '16px', letterSpacing: '4px', fontWeight: 'bold' }}>
        <span style={{ color: 'var(--color-primary)' }}>{spelled.padEnd(targetWord.length, '_')}</span>
      </div>

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '340px',
          aspectRatio: '1 / 1',
          margin: '0 auto',
          backgroundColor: '#e8f5e9',
          border: '4px solid #4caf50',
          borderRadius: '8px',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Render Snake */}
        {snake.map((segment, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${(segment.x / GRID_SIZE) * 100}%`,
              top: `${(segment.y / GRID_SIZE) * 100}%`,
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
              backgroundColor: i === 0 ? '#1b5e20' : '#4caf50',
              borderRadius: i === 0 ? '8px' : '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          />
        ))}

        {/* Render Food */}
        <div
          style={{
            position: 'absolute',
            left: `${(food.x / GRID_SIZE) * 100}%`,
            top: `${(food.y / GRID_SIZE) * 100}%`,
            width: `${100 / GRID_SIZE}%`,
            height: `${100 / GRID_SIZE}%`,
            backgroundColor: '#ff5252',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(255,82,82,0.6)',
          }}
        >
          {food.char}
        </div>

        {gameOver && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.78)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
              fontWeight: 'bold',
              color: spelled === targetWord ? '#4ade80' : '#f87171',
            }}
          >
            {spelled === targetWord ? 'You Win! 🎉' : 'Game Over! 💥'}
          </div>
        )}
      </div>

      {/* Touch D-Pad for Mobile */}
      <div className="mobile-dpad">
        <div />
        <button type="button" className="mobile-dpad-btn" onClick={() => changeDir(0, -1)} aria-label="Move Up">▲</button>
        <div />
        <button type="button" className="mobile-dpad-btn" onClick={() => changeDir(-1, 0)} aria-label="Move Left">◀</button>
        <button type="button" className="mobile-dpad-btn" onClick={() => changeDir(0, 1)} aria-label="Move Down">▼</button>
        <button type="button" className="mobile-dpad-btn" onClick={() => changeDir(1, 0)} aria-label="Move Right">▶</button>
      </div>
      <p style={{ marginTop: '14px', color: 'var(--color-text-secondary)', fontWeight: 'bold', fontSize: '0.85rem' }}>
        Use Arrow Keys or the touch buttons to collect the letters.
      </p>
    </div>
  );
}

export default SnakeSpeller;
