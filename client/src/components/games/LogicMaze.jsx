import { useState, useEffect, useRef } from 'react';

const COMMANDS = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

const MAZES = [
  {
    grid: [
      [0, 0, 1, 0, 3],
      [0, 1, 1, 0, 0],
      [0, 0, 0, 1, 0],
      [1, 1, 0, 0, 0],
      [2, 0, 0, 1, 0],
    ],
    start: { x: 0, y: 4 },
    target: { x: 4, y: 0 },
  },
  {
    grid: [
      [0, 1, 0, 0, 3],
      [0, 1, 0, 1, 0],
      [0, 0, 0, 1, 0],
      [1, 0, 1, 0, 0],
      [2, 0, 0, 0, 1],
    ],
    start: { x: 0, y: 4 },
    target: { x: 4, y: 0 },
  },
  {
    grid: [
      [3, 0, 0, 1, 0],
      [1, 1, 0, 1, 0],
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 2],
    ],
    start: { x: 4, y: 4 },
    target: { x: 0, y: 0 },
  },
];

function LogicMaze({ question, onComplete }) {
  const mazeIndex = ((Number(question?.id) || 1) - 1) % MAZES.length;
  const maze = MAZES[mazeIndex >= 0 ? mazeIndex : 0];
  const { grid, start: startPos, target: targetPos } = maze;

  const [robotPos, setRobotPos] = useState(startPos);
  const [program, setProgram] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [status, setStatus] = useState(question?.question || 'Build your program to reach the flag!');
  const mountedRef = useRef(true);
  const timersRef = useRef([]);

  useEffect(() => {
    mountedRef.current = true;
    const timers = timersRef.current;
    return () => {
      mountedRef.current = false;
      timers.forEach((id) => clearTimeout(id));
    };
  }, []);

  const sleep = (ms) =>
    new Promise((resolve) => {
      const id = setTimeout(resolve, ms);
      timersRef.current.push(id);
    });

  const addCommand = (cmd) => {
    if (isRunning || hasWon) return;
    setProgram((prev) => [...prev, cmd]);
  };

  const removeCommand = (index) => {
    if (isRunning || hasWon) return;
    setProgram((prev) => prev.filter((_, i) => i !== index));
  };

  const clearProgram = () => {
    if (isRunning || hasWon) return;
    setProgram([]);
    setRobotPos(startPos);
    setStatus('Build your program to reach the flag!');
  };

  const runProgram = async () => {
    if (program.length === 0 || isRunning || hasWon) return;
    setIsRunning(true);
    setStatus('Running program...');

    let currentPos = { ...startPos };
    let crashed = false;
    setRobotPos(currentPos);

    for (let i = 0; i < program.length; i++) {
      await sleep(350);
      if (!mountedRef.current) return;

      const cmd = program[i];
      let newX = currentPos.x;
      let newY = currentPos.y;

      if (cmd === 'UP') newY -= 1;
      if (cmd === 'DOWN') newY += 1;
      if (cmd === 'LEFT') newX -= 1;
      if (cmd === 'RIGHT') newX += 1;

      if (newX < 0 || newX > 4 || newY < 0 || newY > 4 || grid[newY][newX] === 1) {
        crashed = true;
        break;
      }

      currentPos = { x: newX, y: newY };
      setRobotPos(currentPos);

      if (currentPos.x === targetPos.x && currentPos.y === targetPos.y) {
        break;
      }
    }

    await sleep(300);
    if (!mountedRef.current) return;

    if (currentPos.x === targetPos.x && currentPos.y === targetPos.y) {
      setStatus('✅ Success! Target reached!');
      setIsRunning(false);
      setHasWon(true);
      onComplete();
    } else {
      setStatus(crashed ? '💥 CRASH! You hit a wall or edge. Try adjusting your steps.' : 'Robot stopped before reaching the flag. Add more steps!');
      await sleep(1200);
      if (mountedRef.current) {
        setRobotPos(startPos);
        setIsRunning(false);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
      <div style={{ fontWeight: 'bold', color: 'var(--color-text)', textAlign: 'center' }}>{status}</div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
          width: '100%',
          maxWidth: '260px',
          aspectRatio: '1 / 1',
          gap: '2px',
          background: 'var(--color-border)',
          padding: '2px',
          borderRadius: '8px',
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => {
            let bg = 'var(--color-surface-raised)';
            if (cell === 1) bg = '#334155';
            if (cell === 3) bg = 'var(--color-success)';

            const isRobotHere = robotPos.x === x && robotPos.y === y;

            return (
              <div
                key={`${x}-${y}`}
                style={{
                  background: bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(16px, 5vw, 24px)',
                }}
              >
                {cell === 3 && !isRobotHere && '🏁'}
                {isRobotHere && '🤖'}
              </div>
            );
          })
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
        {COMMANDS.map((cmd) => (
          <button
            type="button"
            key={cmd}
            className="btn btn-outline"
            onClick={() => addCommand(cmd)}
            disabled={isRunning || hasWon}
            style={{ fontSize: '12px', padding: '8px 12px', minHeight: '40px' }}
          >
            {cmd}
          </button>
        ))}
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          minHeight: '60px',
          background: '#1e1e1e',
          borderRadius: '8px',
          padding: '10px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        {program.length === 0 && (
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>Tap commands above to build your path...</span>
        )}
        {program.map((cmd, i) => (
          <button
            type="button"
            key={i}
            onClick={() => removeCommand(i)}
            disabled={isRunning || hasWon}
            style={{
              background: 'var(--color-primary)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: isRunning || hasWon ? 'default' : 'pointer',
            }}
          >
            {cmd} {isRunning || hasWon ? '' : '✕'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button type="button" className="btn btn-outline" onClick={clearProgram} disabled={isRunning || hasWon || program.length === 0}>
          Clear
        </button>
        <button type="button" className="btn btn-primary" onClick={runProgram} disabled={isRunning || hasWon || program.length === 0}>
          {hasWon ? 'Completed! ✓' : isRunning ? 'Running...' : '▶ Run Program'}
        </button>
      </div>
    </div>
  );
}

export default LogicMaze;
