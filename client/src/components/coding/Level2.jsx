import { useState } from 'react';
import api from '../../services/api';

function Level2({ onComplete }) {
  const [status, setStatus] = useState('Watch the robot collect diamonds, then store the correct amount!');
  const [isRunning, setIsRunning] = useState(false);
  const [diamondsInWorld, setDiamondsInWorld] = useState(0);
  const [animationPhase, setAnimationPhase] = useState('idle');
  const [codeValue, setCodeValue] = useState('0');
  const expectedDiamonds = 3;

  const playCollectionAnimation = async () => {
    if (animationPhase !== 'idle') return;
    setAnimationPhase('collecting');
    setStatus('Robot is collecting diamonds...');
    for (let i = 1; i <= expectedDiamonds; i++) {
      await new Promise(r => setTimeout(r, 800));
      setDiamondsInWorld(i);
    }
    setAnimationPhase('done');
    setStatus('Robot finished! Now, update the C variable to match the chest.');
  };

  const checkCode = async () => {
    setIsRunning(true);
    setStatus('Checking memory...');
    await new Promise(r => setTimeout(r, 1000));
    if (parseInt(codeValue) === expectedDiamonds) {
      setStatus('Success! Variable updated correctly! +50 XP');
      try { await api.post('/points/award', { source: 'coding_quest_l2', points: 50, description: 'Completed C Quest L2' }); } catch (e) {}
      setTimeout(() => { setIsRunning(false); onComplete(); }, 2000);
    } else {
      setStatus(`Error: Memory says ${codeValue}, but chest has ${expectedDiamonds}.`);
      setIsRunning(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <div className="card" style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h3 style={{ marginBottom: '15px' }}>Treasure Storage</h3>
        <div style={{ width: '100%', height: '250px', background: 'linear-gradient(to bottom, #87CEEB, #4CAF50 80%)', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: '40px', left: animationPhase === 'collecting' ? '120px' : '40px', fontSize: '40px', transition: 'left 0.5s ease-in-out' }}>🤖</div>
          <div style={{ position: 'absolute', bottom: '40px', right: '60px', fontSize: '50px' }}>
            🧰
            {diamondsInWorld > 0 && (
              <div style={{ position: 'absolute', top: '-40px', left: '10px', fontSize: '24px', animation: 'bounce 1s infinite' }}>{Array(diamondsInWorld).fill('💎').join('')}</div>
            )}
          </div>
        </div>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={playCollectionAnimation} disabled={animationPhase !== 'idle'}>▶ Watch Action</button>
          <button className="btn btn-outline" onClick={() => { setDiamondsInWorld(0); setAnimationPhase('idle'); setCodeValue('0'); setStatus('Watch the robot collect diamonds, then store the correct amount!'); }}>Reset</button>
        </div>
        <div style={{ marginTop: '15px', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>{status}</div>
      </div>
      <div className="card" style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginBottom: '15px' }}>Computer Memory (Variables)</h3>
        <div style={{ marginBottom: '20px', padding: '15px', background: 'var(--color-surface-hover)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '14px', marginBottom: '10px' }}>A variable is like a box that holds a value.</p>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text)' }}>int diamonds</div>
            <div style={{ width: '100px', height: '60px', margin: '5px auto', border: '2px dashed var(--color-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', background: 'white' }}>{codeValue}</div>
          </div>
        </div>
        <div style={{ flex: '1', background: '#1e1e1e', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', color: '#d4d4d4', minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#569cd6' }}>#include &lt;stdio.h&gt;</div><br />
          <div style={{ color: '#569cd6' }}>int <span style={{ color: '#dcdcaa' }}>main</span>() {'{'}</div>
          <div style={{ paddingLeft: '20px', margin: '10px 0' }}>
            <span style={{ color: '#6a9955', fontStyle: 'italic' }}>// Create a variable to store whole numbers</span><br/>
            <span style={{ color: '#569cd6' }}>int</span> diamonds = 
            <select value={codeValue} onChange={(e) => setCodeValue(e.target.value)} disabled={isRunning || animationPhase !== 'done'} style={{ background: '#333', color: 'white', border: '1px solid #555', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px', marginRight: '4px', fontFamily: 'monospace', fontSize: '14px' }}>
              <option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option>
            </select>;
          </div>
          <div style={{ color: '#c586c0' }}><span style={{ paddingLeft: '20px' }}>return</span> <span style={{ color: '#b5cea8' }}>0</span>;</div>
          <div style={{ color: '#569cd6' }}>{'}'}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
          <button className="btn btn-primary" onClick={checkCode} disabled={isRunning || animationPhase !== 'done'}>{isRunning ? 'Checking...' : 'Run Code'}</button>
        </div>
      </div>
    </div>
  );
}

export default Level2;
