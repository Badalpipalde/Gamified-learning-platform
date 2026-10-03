import { useState, useEffect } from 'react';
import api from '../../services/api';

function Level4({ onComplete }) {
  const [status, setStatus] = useState('Compare the variables to defeat the monster!');
  const [isRunning, setIsRunning] = useState(false);
  
  // Game State
  const [monsterHP, setMonsterHP] = useState(80);
  const [playerAttack, setPlayerAttack] = useState(0);
  const [monsterDefeated, setMonsterDefeated] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Code State
  const [selectedOperator, setSelectedOperator] = useState('>');
  const [threshold, setThreshold] = useState('50');

  const checkCode = async () => {
    setIsRunning(true);
    setAnimating(true);
    setStatus('Evaluating expression...');
    await new Promise(r => setTimeout(r, 1000));
    
    // Evaluate the condition: monsterHP (operator) threshold
    const tVal = Number(threshold);
    if (isNaN(tVal)) {
      setStatus('Error: Threshold must be a number.');
      setIsRunning(false);
      setAnimating(false);
      return;
    }

    let isTrue = false;
    switch(selectedOperator) {
      case '>': isTrue = monsterHP > tVal; break;
      case '<': isTrue = monsterHP < tVal; break;
      case '>=': isTrue = monsterHP >= tVal; break;
      case '<=': isTrue = monsterHP <= tVal; break;
      case '==': isTrue = monsterHP == tVal; break;
      case '!=': isTrue = monsterHP != tVal; break;
    }

    if (isTrue) {
      // The condition is true, attack succeeds!
      setMonsterDefeated(true);
      setStatus('Condition is TRUE! The attack hits! +50 XP');
      try { await api.post('/points/award', { source: 'coding_quest_l4', points: 50, description: 'Completed C Quest L4' }); } catch (e) {}
      setTimeout(() => { setIsRunning(false); setAnimating(false); onComplete(); }, 3000);
    } else {
      setStatus(`Condition is FALSE! (${monsterHP} ${selectedOperator} ${tVal}). The attack missed!`);
      setTimeout(() => { setIsRunning(false); setAnimating(false); }, 2000);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <div className="card" style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h3 style={{ marginBottom: '15px' }}>Math Machine</h3>
        
        <div style={{ width: '100%', height: '300px', background: '#34495e', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.2)' }}>
          {/* Monster */}
          <div style={{ 
            fontSize: '80px', 
            transition: 'all 0.3s',
            transform: monsterDefeated ? 'rotate(90deg) scale(0.5)' : animating ? 'scale(1.1)' : 'scale(1)',
            opacity: monsterDefeated ? 0.3 : 1
          }}>
            👾
          </div>
          
          <div style={{ background: '#e74c3c', color: 'white', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', marginTop: '10px' }}>
            HP: {monsterHP}
          </div>

          {/* Laser beam if true */}
          {monsterDefeated && (
            <div style={{ position: 'absolute', width: '10px', height: '100%', background: '#f1c40f', boxShadow: '0 0 10px #f1c40f', left: '50%', transform: 'translateX(-50%)' }} />
          )}
        </div>
        
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" onClick={() => { setMonsterDefeated(false); setStatus('Compare the variables to defeat the monster!'); }}>Reset</button>
        </div>
        <div style={{ marginTop: '15px', fontWeight: 'bold', color: 'var(--color-primary-dark)', textAlign: 'center' }}>{status}</div>
      </div>

      <div className="card" style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginBottom: '15px' }}>Operators</h3>
        <div style={{ marginBottom: '15px', padding: '10px', background: 'var(--color-surface-hover)', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}>
          Compare values to make decisions!<br/>
          <strong>&gt;</strong> (Greater), <strong>&lt;</strong> (Less), <strong>==</strong> (Equal)<br/>
          If the condition is <strong>true</strong>, your program attacks.
        </div>
        
        <div style={{ flex: '1', background: '#1e1e1e', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', color: '#d4d4d4', display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#569cd6' }}>#include &lt;stdio.h&gt;</div><br />
          <div style={{ color: '#569cd6' }}>int <span style={{ color: '#dcdcaa' }}>main</span>() {'{'}</div>
          
          <div style={{ paddingLeft: '20px', margin: '10px 0', lineHeight: '2' }}>
            <span style={{ color: '#569cd6' }}>int</span> monsterHP = <span style={{ color: '#b5cea8' }}>80</span>;<br/><br/>
            
            <span style={{ color: '#6a9955', fontStyle: 'italic' }}>// Build a TRUE statement to attack</span><br/>
            <span style={{ color: '#c586c0' }}>if</span> ( monsterHP 
            
            <select value={selectedOperator} onChange={(e) => setSelectedOperator(e.target.value)} disabled={isRunning} style={{ background: '#333', color: 'white', border: '1px solid #555', padding: '2px 8px', borderRadius: '4px', margin: '0 8px', fontFamily: 'monospace' }}>
              <option value=">">&gt;</option>
              <option value="<">&lt;</option>
              <option value=">=">&gt;=</option>
              <option value="<=">&lt;=</option>
              <option value="==">==</option>
              <option value="!=">!=</option>
            </select>
            
            <input type="text" value={threshold} onChange={(e) => setThreshold(e.target.value)} disabled={isRunning} placeholder="50" style={{ width: '40px', background: '#333', color: 'white', border: '1px solid #555', padding: '2px 8px', borderRadius: '4px', margin: '0 4px', fontFamily: 'monospace', textAlign: 'center' }} />
            ) {'{'}
            
            <div style={{ paddingLeft: '20px', color: '#dcdcaa' }}>attackMonster();</div>
            {'}'}
          </div>
          
          <div style={{ color: '#c586c0' }}><span style={{ paddingLeft: '20px' }}>return</span> <span style={{ color: '#b5cea8' }}>0</span>;</div>
          <div style={{ color: '#569cd6' }}>{'}'}</div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
          <button className="btn btn-primary" onClick={checkCode} disabled={isRunning}>{isRunning ? 'Executing...' : 'Run Code'}</button>
        </div>
      </div>
    </div>
  );
}

export default Level4;
