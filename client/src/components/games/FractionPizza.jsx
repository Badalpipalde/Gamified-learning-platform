import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function FractionPizza({ question, onComplete, onFail }) {
  const totalSlices = 8;
  const [selectedSlices, setSelectedSlices] = useState(Array(totalSlices).fill(false));
  
  // Extract target from answer (e.g. "4 slices" -> 4)
  const targetSlices = parseInt(question.answer) || 4;

  const handleSliceClick = (index) => {
    setSelectedSlices(prev => {
      const newSlices = [...prev];
      newSlices[index] = !newSlices[index];
      return newSlices;
    });
  };

  const handleReset = () => setSelectedSlices(Array(totalSlices).fill(false));

  const selectedCount = selectedSlices.filter(Boolean).length;

  const handleSubmit = () => {
    if (selectedCount === targetSlices) {
      onComplete();
    } else {
      onFail();
    }
  };

  useEffect(() => {
    setSelectedSlices(Array(totalSlices).fill(false));
  }, [question]);

  // SVG dimensions
  const radius = 148; // slightly less than 150 to account for stroke
  const center = 150;

  const getSlicePath = (index) => {
    const anglePerSlice = 360 / totalSlices;
    const startAngle = index * anglePerSlice;
    const endAngle = (index + 1) * anglePerSlice;

    // Convert angles to radians and adjust to start at top (-90 degrees)
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
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>{question.question}</h2>
      
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        maxWidth: '300px',
        margin: '0 auto', 
      }}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 300 300" 
          style={{ cursor: 'pointer', overflow: 'visible' }}
        >
          <circle cx="150" cy="150" r="148" fill="#fff3e0" stroke="#ff9800" strokeWidth="4" />
          
          {/* Draw slices */}
          {[...Array(totalSlices)].map((_, i) => (
            <path
              key={i}
              d={getSlicePath(i)}
              fill={selectedSlices[i] ? '#ff5722' : 'transparent'}
              stroke="#ff9800"
              strokeWidth="2"
              onClick={() => handleSliceClick(i)}
              style={{ transition: 'fill 0.3s ease' }}
            />
          ))}
          
          {/* Center crust */}
          <circle cx="150" cy="150" r="20" fill="#ffb74d" />
        </svg>
      </div>

      <div style={{ marginTop: '30px', fontSize: '1.5rem', fontWeight: 'bold' }}>
        Selected: {selectedCount} / {totalSlices}
      </div>

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button className="btn btn-outline" onClick={handleReset}>Reset</button>
        <button className="btn btn-primary" onClick={handleSubmit}>Submit Pizza</button>
      </div>
    </div>
  );
}

export default FractionPizza;
