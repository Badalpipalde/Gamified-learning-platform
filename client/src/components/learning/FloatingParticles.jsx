import { useEffect, useState, useMemo } from 'react';

const PARTICLE_SETS = {
  numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '+', '−', '×', '÷', '=', 'π', '√', '%'],
  shapes: ['△', '□', '○', '◇', '⬡', '▽', '⬠', '⬟', '⭐'],
  science: ['⚛', '🧪', '🔬', '🧬', '⚗', '💧', '🌡', '🔋', '⚡'],
  nature: ['🌿', '🌱', '🍃', '🌻', '🌸', '🦋', '🐝', '🌈', '☀'],
  letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'a', 'b', 'c', 'd'],
  hindi: ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', 'क', 'ख', 'ग', 'घ'],
  social: ['🌍', '🗺', '📜', '🏛', '⚖', '🕊', '📖', '🏰', '🗿'],
};

const FloatingParticles = ({ type = 'numbers', count = 18, className = '' }) => {
  const particles = useMemo(() => {
    const set = PARTICLE_SETS[type] || PARTICLE_SETS.numbers;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      char: set[i % set.length],
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 14 + Math.random() * 18,
      duration: 12 + Math.random() * 20,
      delay: Math.random() * -20,
      xDrift: -30 + Math.random() * 60,
      opacity: 0.08 + Math.random() * 0.12,
    }));
  }, [type, count]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute select-none animate-particle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            '--x-drift': `${p.xDrift}px`,
          }}
        >
          {p.char}
        </span>
      ))}
    </div>
  );
};

export default FloatingParticles;
