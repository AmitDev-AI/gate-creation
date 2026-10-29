import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm',
        'dark:border-white/10 dark:bg-ink-900 dark:shadow-none',
        className,
      )}
    >
      {children}
    </section>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  as?: 'h2' | 'h3';
}

export function CardTitle({ children, className, as: Heading = 'h2' }: CardTitleProps) {
  return <Heading className={cn('text-base font-semibold', className)}>{children}</Heading>;
}
