import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

function BubblePop({ question, onComplete, onFail }) {
  const [bubbles, setBubbles] = useState([]);
  const containerRef = useRef(null);
  const dropZoneRef = useRef(null);

  useEffect(() => {
    // Generate bubbles from options
    const newBubbles = (question.options || []).map((opt, i) => ({
      id: i,
      text: opt,
      x: Math.random() * 60 + 20, // 20% to 80% to avoid edges
      y: Math.random() * 30 + 10, // 10% to 40% (top half)
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
      height: 'calc(100vh - 200px)',
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      minHeight: '350px',
      backgroundColor: '#1a1a1a', 
      borderRadius: '16px',
      overflow: 'hidden',
      color: 'white',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h2 style={{ textAlign: 'center', fontSize: '1.8rem', zIndex: 10, position: 'relative' }}>
        {question.question}
      </h2>
      <p style={{ textAlign: 'center', color: '#aaa', zIndex: 10, position: 'relative' }}>
        Drag the correct bubble into the Drop Zone!
      </p>

      {/* Drop Zone */}
      <div 
        ref={dropZoneRef}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '100px',
          border: '3px dashed #4caf50',
          borderRadius: '16px',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
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
          whileDrag={{ scale: 1.2, cursor: 'grabbing', zIndex: 50 }}
          onDragEnd={(e, info) => handleDragEnd(e, info, bubble.text)}
          animate={{
            y: [0, Math.random() * -30 - 10, 0],
            x: [0, Math.random() * 40 - 20, 0]
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
            width: '100px',
            height: '100px',
            backgroundColor: bubble.color,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            cursor: 'grab',
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
