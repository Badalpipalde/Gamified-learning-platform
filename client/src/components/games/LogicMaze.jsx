import { useState, useEffect } from 'react';

// Commands available
const COMMANDS = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

function LogicMaze({ question, onComplete, onFail }) {
  // We represent the maze as a 5x5 grid
  // 0: empty, 1: wall, 2: start, 3: target
  const [grid] = useState([
    [0, 0, 1, 0, 3],
    [0, 1, 1, 0, 0],
    [0, 0, 0, 1, 0],
    [1, 1, 0, 0, 0],
    [2, 0, 0, 1, 0],
  ]);
  
  const startPos = { x: 0, y: 4 };
  const targetPos = { x: 4, y: 0 };
  
  const [robotPos, setRobotPos] = useState(startPos);
  const [program, setProgram] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState('Build your program to reach the target!');

  const addCommand = (cmd) => {
    if (isRunning) return;
    setProgram([...program, cmd]);
  };

  const removeCommand = (index) => {
    if (isRunning) return;
    setProgram(program.filter((_, i) => i !== index));
  };

  const runProgram = async () => {
    if (program.length === 0) return;
    setIsRunning(true);
    setStatus('Running program...');
    
    let currentPos = { ...startPos };
    let crashed = false;
    
    // Reset position first
    setRobotPos(currentPos);
    
    for (let i = 0; i < program.length; i++) {
      await new Promise(r => setTimeout(r, 400)); // Delay for animation
      const cmd = program[i];
      let newX = currentPos.x;
      let newY = currentPos.y;
      
      if (cmd === 'UP') newY -= 1;
      if (cmd === 'DOWN') newY += 1;
      if (cmd === 'LEFT') newX -= 1;
      if (cmd === 'RIGHT') newX += 1;
      
      // Bounds check
      if (newX < 0 || newX > 4 || newY < 0 || newY > 4) {
        crashed = true;
        break;
      }
      
      // Wall check
      if (grid[newY][newX] === 1) {
        crashed = true;
        break;
      }
      
      currentPos = { x: newX, y: newY };
      setRobotPos(currentPos);
      
      if (currentPos.x === targetPos.x && currentPos.y === targetPos.y) {
        break;
      }
    }
    
    await new Promise(r => setTimeout(r, 500));
    
    if (currentPos.x === targetPos.x && currentPos.y === targetPos.y) {
      setStatus('Success! Target reached!');
      setTimeout(onComplete, 1500);
    } else {
      setStatus(crashed ? 'CRASH! You hit a wall or went out of bounds.' : 'Program ended without reaching target.');
      setTimeout(() => {
        setRobotPos(startPos);
        setIsRunning(false);
        // onFail(); // If we want strict failure
      }, 2000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
      <div style={{ fontWeight: 'bold', color: 'var(--color-text)' }}>{status}</div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 50px)',
        gridTemplateRows: 'repeat(5, 50px)',
        gap: '2px',
        background: 'var(--color-border)',
        padding: '2px',
        borderRadius: '8px'
      }}>
        {grid.map((row, y) => row.map((cell, x) => {
          let bg = 'white';
          if (cell === 1) bg = '#333';
          if (cell === 3) bg = 'var(--color-success)'; // Target
          
          const isRobotHere = robotPos.x === x && robotPos.y === y;
          
          return (
            <div key={`${x}-${y}`} style={{
              background: bg,
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              {cell === 3 && !isRobotHere && '🏁'}
              {isRobotHere && '🤖'}
            </div>
          );
        }))}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        {COMMANDS.map(cmd => (
          <button 
            key={cmd}
            className="btn btn-outline"
            onClick={() => addCommand(cmd)}
            disabled={isRunning}
            style={{ fontSize: '12px', padding: '8px 12px' }}
          >
            {cmd}
          </button>
        ))}
      </div>
      
      <div style={{
        width: '100%',
        minHeight: '60px',
        background: '#1e1e1e',
        borderRadius: '8px',
        padding: '10px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center'
      }}>
        {program.length === 0 && <span style={{ color: '#666', fontSize: '14px' }}>Program is empty...</span>}
        {program.map((cmd, i) => (
          <div 
            key={i}
            onClick={() => removeCommand(i)}
            style={{
              background: 'var(--color-primary)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: isRunning ? 'default' : 'pointer'
            }}
          >
            {cmd} {isRunning ? '' : '✕'}
          </div>
        ))}
      </div>

      <button className="btn btn-primary" onClick={runProgram} disabled={isRunning || program.length === 0}>
        {isRunning ? 'Running...' : 'Run Program'}
      </button>
    </div>
  );
}

export default LogicMaze;
