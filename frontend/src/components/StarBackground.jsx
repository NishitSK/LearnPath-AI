import React, { useMemo } from 'react';
import './StarBackground.css';

export default function StarBackground() {
  const stars = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: `${Math.random() * 2 + 1}px`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${Math.random() * 3 + 3}s`
    }));
  }, []);

  return (
    <div className="star-background" aria-hidden="true">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            animationDelay: star.animationDelay,
            animationDuration: star.animationDuration
          }}
        />
      ))}
    </div>
  );
}
