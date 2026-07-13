'use client';

import { animate, useInView } from 'framer-motion';
import * as React from 'react';

import { formatNumber } from '@/shared/lib/utils';

interface CountUpProps {
  value: number;
  className?: string;
  format?: boolean;
  duration?: number;
}

/** Animated number that tweens whenever `value` changes (and on first view). */
export function CountUp({ value, className, format = false, duration = 0.8 }: CountUpProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const prev = React.useRef(0);

  React.useEffect(() => {
    if (!inView) return;
    const node = ref.current;
    if (!node) return;
    const controls = animate(prev.current, value, {
      duration,
      ease: 'easeOut',
      onUpdate(v) {
        node.textContent = format ? formatNumber(Math.round(v)) : Math.round(v).toLocaleString();
      },
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, inView, format, duration]);

  return <span ref={ref} className={className}>0</span>;
}
