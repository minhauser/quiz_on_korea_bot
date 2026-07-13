'use client';

import { motion } from 'framer-motion';
import * as React from 'react';

import { CountUp } from '@/shared/ui/count-up';
import { cn } from '@/shared/lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  accent?: string;
  index?: number;
}

export function StatCard({ icon, label, value, suffix, accent = 'from-primary to-secondary', index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
    >
      <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white', accent)}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xl font-black leading-none">
          <CountUp value={value} />
          {suffix}
        </p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}
