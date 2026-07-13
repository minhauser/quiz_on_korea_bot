'use client';

import { motion } from 'framer-motion';

import { cn } from '@/shared/lib/utils';

interface ProgressProps {
  value: number; // 0..100
  className?: string;
  indicatorClassName?: string;
}

export function Progress({ value, className, indicatorClassName }: ProgressProps) {
  return (
    <div className={cn('h-2.5 w-full overflow-hidden rounded-full bg-muted', className)}>
      <motion.div
        className={cn(
          'h-full rounded-full bg-gradient-to-r from-primary to-secondary',
          indicatorClassName,
        )}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />
    </div>
  );
}
