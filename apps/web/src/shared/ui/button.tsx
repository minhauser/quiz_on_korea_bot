'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110',
        gradient:
          'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30 hover:brightness-110',
        success:
          'bg-success text-success-foreground shadow-lg shadow-success/25 hover:brightness-110',
        secondary: 'bg-muted text-foreground hover:bg-accent',
        outline: 'border border-border bg-transparent hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive:
          'bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25 hover:brightness-110',
      },
      size: {
        sm: 'h-9 px-3',
        default: 'h-11 px-5',
        lg: 'h-13 px-7 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  ),
);
Button.displayName = 'Button';

export { buttonVariants };
