'use client';

import { motion } from 'framer-motion';

interface MasteryBarsProps {
  data: { label: string; value: number }[];
}

export function MasteryBars({ data }: MasteryBarsProps) {
  return (
    <div className="space-y-4">
      {data.map((d, i) => (
        <div key={d.label}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium">{d.label}</span>
            <span className="font-semibold text-muted-foreground">{Math.round(d.value * 100)}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
              initial={{ width: 0 }}
              whileInView={{ width: `${d.value * 100}%` }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 90, damping: 18 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
