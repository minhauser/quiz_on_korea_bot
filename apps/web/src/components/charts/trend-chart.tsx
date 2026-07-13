'use client';

import { motion } from 'framer-motion';

interface TrendChartProps {
  values: number[];
  height?: number;
}

export function TrendChart({ values, height = 180 }: TrendChartProps) {
  const width = 600;
  const pad = 12;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  const area = `${line} L ${points[points.length - 1]?.[0]} ${height} L ${points[0]?.[0]} ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id="trend-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--secondary))" />
        </linearGradient>
        <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill="url(#trend-fill)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.3 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke="url(#trend-line)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
      />
      {points.map((p, i) => (
        <motion.circle
          key={i}
          cx={p[0]}
          cy={p[1]}
          r={3.5}
          fill="hsl(var(--background))"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 + i * 0.04 }}
        />
      ))}
    </svg>
  );
}
