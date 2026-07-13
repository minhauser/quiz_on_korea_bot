'use client';

import { motion } from 'framer-motion';
import * as React from 'react';

const COLORS = ['#6366f1', '#a855f7', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4'];

interface Piece {
  id: number;
  x: number;
  rotate: number;
  delay: number;
  color: string;
  size: number;
}

export function Confetti({ count = 80 }: { count?: number }) {
  const pieces = React.useMemo<Piece[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 600,
        rotate: Math.random() * 720 - 360,
        delay: Math.random() * 0.25,
        color: COLORS[i % COLORS.length] as string,
        size: 6 + Math.random() * 8,
      })),
    [count],
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex items-start justify-center overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-1/3"
          style={{ width: p.size, height: p.size * 0.5, backgroundColor: p.color, borderRadius: 2 }}
          initial={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
          animate={{ opacity: [1, 1, 0], y: 420, x: p.x, rotate: p.rotate }}
          transition={{ duration: 1.8 + Math.random(), delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}
