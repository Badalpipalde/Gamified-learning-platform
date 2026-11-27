import { useState } from 'react';

function FractionPizza({ question, onComplete, onFail }) {
  const totalSlices = 8;
  const [selectedSlices, setSelectedSlices] = useState(() => Array(totalSlices).fill(false));
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'

  const targetSlices = parseInt(question.answer, 10) || 4;

  const handleSliceClick = (index) => {
    if (feedback !== null) return;
    setSelectedSlices((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const handleReset = () => {
    if (feedback !== null) return;
    setSelectedSlices(Array(totalSlices).fill(false));
  };

  const selectedCount = selectedSlices.filter(Boolean).length;

  const handleSubmit = () => {
    if (feedback !== null) return;
    const isCorrect = selectedCount === targetSlices;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      onComplete();
    } else {
      onFail();
    }
  };

  const radius = 148;
  const center = 150;

  const getSlicePath = (index) => {
    const anglePerSlice = 360 / totalSlices;
    const startAngle = index * anglePerSlice;
    const endAngle = (index + 1) * anglePerSlice;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArcFlag = anglePerSlice > 180 ? 1 : 0;
    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <div style={{ textAlign: 'center', padding: 'clamp(12px, 3vw, 24px)' }}>
      <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.85rem)', marginBottom: '20px', color: 'var(--color-text)' }}>
        {question.question}
      </h2>

      <div style={{ position: 'relative', width: '100%', maxWidth: '280px', margin: '0 auto' }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 300 300"
          style={{ cursor: feedback ? 'default' : 'pointer', overflow: 'visible' }}
        >
          <circle cx="150" cy="150" r="148" fill="#fff3e0" stroke="#ff9800" strokeWidth="4" />

          {[...Array(totalSlices)].map((_, i) => (
            <path
              key={i}
              d={getSlicePath(i)}
              fill={selectedSlices[i] ? '#ff5722' : 'transparent'}
              stroke="#ff9800"
              strokeWidth="2"
              onClick={() => handleSliceClick(i)}
              style={{ transition: 'fill 0.2s ease' }}
            />
          ))}

          <circle cx="150" cy="150" r="20" fill="#ffb74d" />
        </svg>
      </div>

      <div style={{ marginTop: '20px', fontSize: 'clamp(1.1rem, 3.5vw, 1.4rem)', fontWeight: 'bold', color: 'var(--color-text)' }}>
        Selected: {selectedCount} / {totalSlices}
      </div>

      <div style={{ minHeight: '28px', marginTop: '10px' }}>
        {feedback === 'correct' && (
          <div style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
            ✅ Perfect! {selectedCount}/{totalSlices} slices!
          </div>
        )}
        {feedback === 'wrong' && (
          <div style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>
            ❌ Needed {targetSlices}/{totalSlices} slices!
          </div>
        )}
      </div>

      <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
        <button type="button" className="btn btn-outline" onClick={handleReset} disabled={feedback !== null}>
          Reset
        </button>
        <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={feedback !== null}>
          Submit Pizza
        </button>
      </div>
    </div>
  );
}

export default FractionPizza;
