'use client';

import { motion } from 'framer-motion';

interface BarChartProps {
  data: { label: string; value: number }[];
}

export function BarChart({ data }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex h-48 items-end justify-between gap-2 sm:gap-3">
      {data.map((d, i) => (
        <div key={d.label} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
          <span className="text-xs font-semibold text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            {d.value}
          </span>
          <div className="flex w-full flex-1 items-end">
            <motion.div
              className="w-full rounded-t-lg bg-gradient-to-t from-primary/70 to-secondary"
              initial={{ height: 0 }}
              whileInView={{ height: `${(d.value / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 120, damping: 18 }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
