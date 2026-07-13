'use client';

import { motion } from 'framer-motion';

import { cn } from '@/shared/lib/utils';

const LEVELS = [
  'bg-muted',
  'bg-primary/25',
  'bg-primary/45',
  'bg-primary/70',
  'bg-primary',
];

export function Heatmap({ grid }: { grid: number[][] }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {grid.map((week, w) => (
          <div key={w} className="flex flex-col gap-1">
            {week.map((intensity, d) => (
              <motion.div
                key={d}
                className={cn('size-3 rounded-sm', LEVELS[intensity] ?? LEVELS[0])}
                initial={{ opacity: 0, scale: 0.4 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (w * 7 + d) * 0.004 }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
        Less
        {LEVELS.map((l, i) => (
          <span key={i} className={cn('size-3 rounded-sm', l)} />
        ))}
        More
      </div>
    </div>
  );
}
