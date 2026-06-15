/**
 * FloatingPetals — decorative SVG cherry blossom petals that drift down
 * Purely CSS-animated, GPU-safe (transforms + opacity only)
 */

const PETALS = [
  // [left%, delay_s, duration_s, size_px, color]
  ['8%',   0.0,  9, 22, '#E8B4B8'],
  ['15%',  1.5, 12, 18, '#C8B8D4'],
  ['25%',  0.8, 10, 26, '#F2D7D9'],
  ['35%',  2.2,  8, 20, '#E8B4B8'],
  ['48%',  3.5, 11, 24, '#C8B8D4'],
  ['60%',  0.4, 13, 16, '#F2D7D9'],
  ['70%',  2.8,  9, 28, '#E8B4B8'],
  ['78%',  1.0, 10, 18, '#C8B8D4'],
  ['87%',  3.2, 12, 22, '#F2D7D9'],
  ['93%',  0.7,  8, 20, '#E8B4B8'],
  ['12%',  4.5, 14, 16, '#C8B8D4'],
  ['42%',  1.8,  9, 24, '#F2D7D9'],
  ['55%',  3.0, 11, 18, '#E8B4B8'],
  ['72%',  2.1, 10, 22, '#C8B8D4'],
  ['82%',  0.2, 13, 26, '#F2D7D9'],
];

import { useState } from 'react';

// Simple cherry blossom petal SVG path
function PetalSVG({ color, size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* 5-petal flower using ellipses */}
      <ellipse cx="20" cy="10" rx="6" ry="10" fill={color} opacity="0.7" transform="rotate(0 20 20)" />
      <ellipse cx="20" cy="10" rx="6" ry="10" fill={color} opacity="0.7" transform="rotate(72 20 20)" />
      <ellipse cx="20" cy="10" rx="6" ry="10" fill={color} opacity="0.7" transform="rotate(144 20 20)" />
      <ellipse cx="20" cy="10" rx="6" ry="10" fill={color} opacity="0.7" transform="rotate(216 20 20)" />
      <ellipse cx="20" cy="10" rx="6" ry="10" fill={color} opacity="0.7" transform="rotate(288 20 20)" />
      <circle cx="20" cy="20" r="4" fill="#FDF8F5" opacity="0.9" />
    </svg>
  );
}

export default function FloatingPetals({ explosion = false }) {
  const [explosionPetals] = useState(() => {
    if (!explosion) return [];
    return Array.from({ length: 45 }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 400 + Math.random() * 800; // how far they fly
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const rot = (Math.random() - 0.5) * 720; // rotation
      const scale = 0.5 + Math.random() * 1.5;
      const duration = 2.0 + Math.random() * 2.0;
      const color = ['#E8B4B8', '#C8B8D4', '#F2D7D9'][Math.floor(Math.random() * 3)];
      return { x, y, rot, scale, duration, color };
    });
  });

  return (
    <div className="petal-layer" aria-hidden="true">
      {PETALS.map(([left, delay, duration, size, color], i) => (
        <div
          key={i}
          className="petal"
          style={{
            left,
            top: '-60px',
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
            width: size,
            height: size,
          }}
        >
          <PetalSVG color={color} size={size} />
        </div>
      ))}

      {explosion && explosionPetals.map((p, i) => (
        <div
          key={`exp-${i}`}
          className="petal explosion"
          style={{
            '--explode-x': `${p.x}px`,
            '--explode-y': `${p.y}px`,
            '--explode-rot': `${p.rot}deg`,
            '--explode-scale': p.scale,
            animationDuration: `${p.duration}s`,
            width: 20, height: 20
          }}
        >
          <PetalSVG color={p.color} size={20} />
        </div>
      ))}
    </div>
  );
}
