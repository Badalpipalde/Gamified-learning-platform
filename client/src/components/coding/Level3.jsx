import { useState } from 'react';
import api from '../../services/api';

function Level3({ onComplete }) {
  const [status, setStatus] = useState('Build your character by assigning the correct Data Types!');
  const [isRunning, setIsRunning] = useState(false);
  
  // Game State
  const [characterBuilt, setCharacterBuilt] = useState(false);

  // Code State
  const [ageValue, setAgeValue] = useState('');
  const [heightValue, setHeightValue] = useState('');
  const [initialValue, setInitialValue] = useState('');

  const checkCode = async () => {
    setIsRunning(true);
    setStatus('Compiling Data Types...');
    await new Promise(r => setTimeout(r, 1000));
    
    let hasError = false;

    // Check INT (whole number)
    const ageNum = Number(ageValue);
    if (ageValue === '' || isNaN(ageNum) || !Number.isInteger(ageNum)) {
      setStatus('Error: `int age` must be a whole number (e.g., 12).');
      hasError = true;
    } 
    // Check FLOAT (decimal number)
    else if (heightValue === '' || isNaN(Number(heightValue)) || Number.isInteger(Number(heightValue))) {
      setStatus('Error: `float height` must be a decimal number (e.g., 5.4).');
      hasError = true;
    }
    // Check CHAR (single character)
    else if (initialValue.length !== 1 || !/^[a-zA-Z]$/.test(initialValue)) {
      setStatus("Error: `char initial` must be a single letter (e.g., 'A').");
      hasError = true;
    }

    if (!hasError) {
      setCharacterBuilt(true);
      setStatus('Success! Character created using Data Types! +50 XP');
      try { await api.post('/points/award', { source: 'coding_quest_l3', points: 50, description: 'Completed C Quest L3' }); } catch (e) {}
      setTimeout(() => { setIsRunning(false); onComplete(); }, 3000);
    } else {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <div className="card" style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h3 style={{ marginBottom: '15px' }}>Character Creator</h3>
        
        <div style={{ width: '100%', height: '300px', background: '#2c3e50', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.2)' }}>
          {characterBuilt ? (
            <div style={{ animation: 'bounce 2s infinite', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '80px', filter: 'drop-shadow(0 0 10px #f1c40f)' }}>🦸🏽‍♂️</div>
              <div style={{ background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '8px', color: 'white', marginTop: '10px', textAlign: 'center' }}>
                <div><strong>{initialValue.toUpperCase()}</strong></div>
                <div>Age: {ageValue}</div>
                <div>Height: {heightValue}ft</div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '80px', opacity: 0.3, filter: 'grayscale(100%)' }}>👤</div>
          )}
        </div>
        
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" onClick={() => { setCharacterBuilt(false); setAgeValue(''); setHeightValue(''); setInitialValue(''); setStatus('Build your character by assigning the correct Data Types!'); }}>Reset</button>
        </div>
        <div style={{ marginTop: '15px', fontWeight: 'bold', color: 'var(--color-primary-dark)', textAlign: 'center' }}>{status}</div>
      </div>

      <div className="card" style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginBottom: '15px' }}>Data Types</h3>
        <div style={{ marginBottom: '15px', padding: '10px', background: 'var(--color-surface-hover)', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}>
          <strong>int</strong> → Whole numbers (12, 100)<br/>
          <strong>float</strong> → Decimal numbers (5.4, 3.14)<br/>
          <strong>char</strong> → Single character ('A', 'X')
        </div>
        
        <div style={{ flex: '1', background: '#1e1e1e', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', color: '#d4d4d4', display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#569cd6' }}>#include &lt;stdio.h&gt;</div><br />
          <div style={{ color: '#569cd6' }}>int <span style={{ color: '#dcdcaa' }}>main</span>() {'{'}</div>
          
          <div style={{ paddingLeft: '20px', margin: '10px 0', lineHeight: '2' }}>
            <span style={{ color: '#6a9955', fontStyle: 'italic' }}>// 1. Assign a whole number for age</span><br/>
            <span style={{ color: '#569cd6' }}>int</span> age = 
            <input type="text" value={ageValue} onChange={(e) => setAgeValue(e.target.value)} disabled={isRunning} placeholder="12" style={{ width: '50px', background: '#333', color: 'white', border: '1px solid #555', padding: '2px 8px', borderRadius: '4px', margin: '0 8px', fontFamily: 'monospace', textAlign: 'center' }} />;
            <br/>
            
            <span style={{ color: '#6a9955', fontStyle: 'italic' }}>// 2. Assign a decimal number for height</span><br/>
            <span style={{ color: '#569cd6' }}>float</span> height = 
            <input type="text" value={heightValue} onChange={(e) => setHeightValue(e.target.value)} disabled={isRunning} placeholder="5.4" style={{ width: '60px', background: '#333', color: 'white', border: '1px solid #555', padding: '2px 8px', borderRadius: '4px', margin: '0 8px', fontFamily: 'monospace', textAlign: 'center' }} />;
            <br/>

            <span style={{ color: '#6a9955', fontStyle: 'italic' }}>// 3. Assign a single letter for initial</span><br/>
            <span style={{ color: '#569cd6' }}>char</span> initial = '
            <input type="text" maxLength={1} value={initialValue} onChange={(e) => setInitialValue(e.target.value.toUpperCase())} disabled={isRunning} placeholder="B" style={{ width: '30px', background: '#333', color: 'white', border: '1px solid #555', padding: '2px 4px', borderRadius: '4px', margin: '0 4px', fontFamily: 'monospace', textAlign: 'center' }} />
            ';
          </div>
          
          <div style={{ color: '#c586c0' }}><span style={{ paddingLeft: '20px' }}>return</span> <span style={{ color: '#b5cea8' }}>0</span>;</div>
          <div style={{ color: '#569cd6' }}>{'}'}</div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
          <button className="btn btn-primary" onClick={checkCode} disabled={isRunning}>{isRunning ? 'Compiling...' : 'Run Code'}</button>
        </div>
      </div>
    </div>
  );
}

export default Level3;
