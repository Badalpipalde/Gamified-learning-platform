import { useState, useEffect, useRef } from 'react';

function SnakeSpeller({ question, onComplete, onFail }) {
  const targetWord = (question.answer || "APPLE").toUpperCase();
  const [spelled, setSpelled] = useState("");
  const [snake, setSnake] = useState([{x: 5, y: 5}]);
  const [dir, setDir] = useState({x: 0, y: -1});
  const [food, setFood] = useState({x: 3, y: 3, char: targetWord[0]});
  const [gameOver, setGameOver] = useState(false);
  
  const gridSize = 10;
  
  // Use a ref for current state to avoid closure issues in the interval
  const stateRef = useRef({ snake, dir, spelled, food, gameOver });
  
  useEffect(() => {
    stateRef.current = { snake, dir, spelled, food, gameOver };
  });

  useEffect(() => {
    setSpelled("");
    setSnake([{x: 5, y: 5}]);
    setDir({x: 0, y: -1});
    setFood({x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize), char: targetWord[0]});
    setGameOver(false);
  }, [question, targetWord]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const { dir } = stateRef.current;
      if (e.key === 'ArrowUp' && dir.y !== 1) setDir({x: 0, y: -1});
      if (e.key === 'ArrowDown' && dir.y !== -1) setDir({x: 0, y: 1});
      if (e.key === 'ArrowLeft' && dir.x !== 1) setDir({x: -1, y: 0});
      if (e.key === 'ArrowRight' && dir.x !== -1) setDir({x: 1, y: 0});
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      const { snake, dir, spelled, food, gameOver } = stateRef.current;
      if (gameOver) return;

      const newHead = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      
      // Hit wall
      if (newHead.x < 0 || newHead.x >= gridSize || newHead.y < 0 || newHead.y >= gridSize) {
        setGameOver(true);
        setTimeout(onFail, 1000);
        return;
      }
      
      const newSnake = [newHead, ...snake];

      // Eat food
      if (newHead.x === food.x && newHead.y === food.y) {
        const newSpelled = spelled + food.char;
        setSpelled(newSpelled);
        
        if (newSpelled === targetWord) {
          setGameOver(true);
          setTimeout(onComplete, 1000);
          return;
        } else {
          // spawn next letter
          setFood({
            x: Math.floor(Math.random() * gridSize), 
            y: Math.floor(Math.random() * gridSize), 
            char: targetWord[newSpelled.length]
          });
        }
      } else {
        newSnake.pop();
      }
      
      setSnake(newSnake);
    }, 400);

    return () => clearInterval(tick);
  }, [targetWord, onComplete, onFail]);

  return (
    <div style={{ textAlign: 'center', padding: '10px' }}>
      <h2 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>{question.question}</h2>
      <div style={{ fontSize: '1.8rem', marginBottom: '20px', letterSpacing: '4px', fontWeight: 'bold' }}>
        <span style={{ color: 'var(--color-primary)' }}>{spelled.padEnd(targetWord.length, '_')}</span>
      </div>
      
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        maxWidth: '350px',
        height: '350px', 
        margin: '0 auto', 
        backgroundColor: '#e8f5e9',
        border: '4px solid #4caf50',
        borderRadius: '8px',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)'
      }}>
        {/* Render Snake */}
        {snake.map((segment, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${(segment.x / gridSize) * 100}%`,
            top: `${(segment.y / gridSize) * 100}%`,
            width: `${100 / gridSize}%`,
            height: `${100 / gridSize}%`,
            backgroundColor: i === 0 ? '#1b5e20' : '#4caf50',
            borderRadius: i === 0 ? '8px' : '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }} />
        ))}
        
        {/* Render Food */}
        <div style={{
            position: 'absolute',
            left: `${(food.x / gridSize) * 100}%`,
            top: `${(food.y / gridSize) * 100}%`,
            width: `${100 / gridSize}%`,
            height: `${100 / gridSize}%`,
            backgroundColor: '#ff5252',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(255,82,82,0.6)'
        }}>
          {food.char}
        </div>

        {gameOver && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#d32f2f'
          }}>
            {spelled === targetWord ? 'You Win!' : 'Game Over'}
          </div>
        )}
      </div>
      <p style={{ marginTop: '20px', color: '#666', fontWeight: 'bold' }}>Use Arrow Keys to guide the snake to collect the letters.</p>
    </div>
  );
}

export default SnakeSpeller;
