import { useState } from 'react';
import api from '../../services/api';

function Level1({ onComplete }) {
  const [status, setStatus] = useState('Build your program to reach the treasure! 🏆');
  const [isRunning, setIsRunning] = useState(false);
  const [program, setProgram] = useState([]);
  const [robotPos, setRobotPos] = useState({ x: 0, y: 4, dir: 'RIGHT' });
  
  const grid = [
    [0, 0, 1, 0, 3],
    [0, 1, 1, 0, 0],
    [0, 0, 0, 1, 0],
    [1, 1, 0, 0, 0],
    [2, 0, 0, 1, 0],
  ];
  const startPos = { x: 0, y: 4, dir: 'RIGHT' };
  const targetPos = { x: 4, y: 0 };
  const availableCommands = ['move();', 'turnLeft();', 'turnRight();', 'jump();'];

  const runCode = async () => {
    if (program.length === 0) return;
    setIsRunning(true);
    setStatus('Executing C instructions...');
    
    let currentPos = { ...startPos };
    let crashed = false;
    setRobotPos(currentPos);
    
    for (let i = 0; i < program.length; i++) {
      await new Promise(r => setTimeout(r, 400));
      const cmd = program[i];
      let newX = currentPos.x, newY = currentPos.y, newDir = currentPos.dir;
      
      if (cmd === 'move();') {
        if (newDir === 'UP') newY -= 1;
        if (newDir === 'DOWN') newY += 1;
        if (newDir === 'LEFT') newX -= 1;
        if (newDir === 'RIGHT') newX += 1;
      } else if (cmd === 'turnLeft();') {
        const dirs = ['UP', 'LEFT', 'DOWN', 'RIGHT'];
        newDir = dirs[(dirs.indexOf(newDir) + 1) % 4];
      } else if (cmd === 'turnRight();') {
        const dirs = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
        newDir = dirs[(dirs.indexOf(newDir) + 1) % 4];
      } else if (cmd === 'jump();') {
        if (newDir === 'UP') newY -= 2;
        if (newDir === 'DOWN') newY += 2;
        if (newDir === 'LEFT') newX -= 2;
        if (newDir === 'RIGHT') newX += 2;
      }
      
      if (newX < 0 || newX > 4 || newY < 0 || newY > 4) { crashed = true; break; }
      if (grid[newY][newX] === 1) { crashed = true; break; }
      
      currentPos = { x: newX, y: newY, dir: newDir };
      setRobotPos(currentPos);
      if (currentPos.x === targetPos.x && currentPos.y === targetPos.y) break;
    }
    
    await new Promise(r => setTimeout(r, 500));
    if (currentPos.x === targetPos.x && currentPos.y === targetPos.y) {
      setStatus('Success! Level 1 Completed! +50 XP');
      try { await api.post('/points/award', { source: 'coding_quest_l1', points: 50, description: 'Completed C Quest L1' }); } catch (e) {}
      setTimeout(() => { setIsRunning(false); onComplete(); }, 2000);
    } else {
      setStatus(crashed ? 'CRASH! You hit a tree 🌳 or went out of bounds.' : 'Program ended without reaching the treasure.');
      setTimeout(() => { setRobotPos(startPos); setIsRunning(false); }, 2000);
    }
  };

  const getRobotRotation = (dir) => {
    if (dir === 'UP') return '-90deg';
    if (dir === 'DOWN') return '90deg';
    if (dir === 'LEFT') return '180deg';
    return '0deg';
  };

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <div className="card" style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h3 style={{ marginBottom: '15px' }}>Game World</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 60px)', gap: '2px', background: 'var(--color-border)', padding: '4px', borderRadius: '12px' }}>
          {grid.map((row, y) => row.map((cell, x) => (
            <div key={`${x}-${y}`} style={{ background: cell === 1 ? '#4caf50' : cell === 3 ? '#ffeb3b' : '#8bc34a', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
              {cell === 1 && '🌳'}{cell === 3 && !(robotPos.x === x && robotPos.y === y) && '💎'}
              {(robotPos.x === x && robotPos.y === y) && <div style={{ transform: `rotate(${getRobotRotation(robotPos.dir)})`, transition: 'all 0.3s' }}>🤖</div>}
            </div>
          )))}
        </div>
        <div style={{ marginTop: '20px', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>{status}</div>
      </div>
      <div className="card" style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginBottom: '15px' }}>C Code Editor</h3>
        <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {availableCommands.map(cmd => (
            <button key={cmd} className="btn btn-outline" onClick={() => setProgram([...program, cmd])} disabled={isRunning} style={{ fontFamily: 'monospace', fontSize: '14px', padding: '6px 12px' }}>{cmd}</button>
          ))}
        </div>
        <div style={{ flex: '1', background: '#1e1e1e', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', color: '#d4d4d4', minHeight: '200px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ color: '#569cd6' }}>#include &lt;stdio.h&gt;</div><br />
          <div style={{ color: '#569cd6' }}>int <span style={{ color: '#dcdcaa' }}>main</span>() {'{'}</div>
          <div style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px', margin: '10px 0' }}>
            {program.length === 0 && <span style={{ color: '#6a9955', fontStyle: 'italic' }}>// Add commands here...</span>}
            {program.map((cmd, i) => (
              <div key={i} onClick={() => !isRunning && setProgram(program.filter((_, idx) => idx !== i))} style={{ cursor: isRunning ? 'default' : 'pointer', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', width: 'fit-content' }}>
                <span style={{ color: '#dcdcaa' }}>{cmd.replace('();', '')}</span><span style={{ color: '#d4d4d4' }}>();</span>
              </div>
            ))}
          </div>
          <div style={{ color: '#c586c0' }}><span style={{ paddingLeft: '20px' }}>return</span> <span style={{ color: '#b5cea8' }}>0</span>;</div>
          <div style={{ color: '#569cd6' }}>{'}'}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px', gap: '10px' }}>
          <button className="btn btn-outline" onClick={() => setProgram([])} disabled={isRunning || program.length === 0}>Clear</button>
          <button className="btn btn-primary" onClick={runCode} disabled={isRunning || program.length === 0}>▶ Run Code</button>
        </div>
      </div>
    </div>
  );
}

export default Level1;
