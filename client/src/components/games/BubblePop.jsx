import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

function BubblePop({ question, onComplete, onFail }) {
  const [bubbles, setBubbles] = useState([]);
  const containerRef = useRef(null);
  const dropZoneRef = useRef(null);

  useEffect(() => {
    // Generate bubbles from options within safe bounds for mobile screens
    const newBubbles = (question.options || []).map((opt, i) => ({
      id: i,
      text: opt,
      x: Math.random() * 52 + 12, // 12% to 64% so 70-96px bubble stays inside narrow screens
      y: Math.random() * 28 + 14, // 14% to 42% (top half)
      speed: Math.random() * 3 + 2,
      color: `hsl(${Math.random() * 360}, 80%, 60%)`
    }));
    setBubbles(newBubbles);
  }, [question]);

  const handleDragEnd = (event, info, text) => {
    if (!dropZoneRef.current) return;
    
    // Check if the pointer was released inside the drop zone bounds
    const dropBounds = dropZoneRef.current.getBoundingClientRect();
    const { x, y } = info.point;

    if (
      x >= dropBounds.left && x <= dropBounds.right &&
      y >= dropBounds.top && y <= dropBounds.bottom
    ) {
      if (text === question.answer) {
        onComplete();
      } else {
        onFail();
      }
    }
  };

  return (
    <div ref={containerRef} style={{ 
      position: 'relative', 
      height: 'clamp(360px, 62dvh, 520px)',
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: '#1a1a1a', 
      borderRadius: '16px',
      overflow: 'hidden',
      color: 'white',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      touchAction: 'none'
    }}>
      <h2 style={{ textAlign: 'center', color: '#ddd', fontSize: 'clamp(1.15rem, 4vw, 1.75rem)', zIndex: 10, position: 'relative' }}>
        {question.question}
      </h2>
      <p style={{ textAlign: 'center', color: '#aaa', fontSize: '0.85rem', zIndex: 10, position: 'relative', marginTop: '4px' }}>
        Drag the correct bubble into the Drop Zone!
      </p>

      {/* Drop Zone */}
      <div 
        ref={dropZoneRef}
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '86%',
          height: '84px',
          border: '3px dashed #4caf50',
          borderRadius: '16px',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'clamp(1rem, 3.5vw, 1.4rem)',
          fontWeight: 'bold',
          color: '#4caf50',
          zIndex: 5
        }}
      >
        Drop Answer Here
      </div>

      {bubbles.map(bubble => (
        <motion.div
          key={bubble.id}
          drag
          dragConstraints={containerRef}
          whileDrag={{ scale: 1.15, cursor: 'grabbing', zIndex: 50 }}
          onDragEnd={(e, info) => handleDragEnd(e, info, bubble.text)}
          animate={{
            y: [0, Math.random() * -20 - 8, 0],
            x: [0, Math.random() * 24 - 12, 0]
          }}
          transition={{
            duration: bubble.speed,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            width: 'clamp(68px, 18vw, 96px)',
            height: 'clamp(68px, 18vw, 96px)',
            backgroundColor: bubble.color,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '6px',
            fontWeight: 'bold',
            fontSize: 'clamp(0.85rem, 3vw, 1.15rem)',
            cursor: 'grab',
            touchAction: 'none',
            boxShadow: 'inset -10px -10px 20px rgba(0,0,0,0.3), 0 5px 15px rgba(0,0,0,0.4)',
            color: '#fff',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            zIndex: 10
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9, cursor: 'grabbing' }}
        >
          {bubble.text}
        </motion.div>
      ))}
    </div>
  );
}

export default BubblePop;
