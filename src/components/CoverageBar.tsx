import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

interface CoverageBarProps {
  value: number;
  max: number;
  label: string;
  className?: string;
}

/**
 * Accessible coverage meter. The visible bar is decorative; the real numbers are exposed
 * through `role="progressbar"` and the label, so screen readers get "19 of 35".
 */
export function CoverageBar({ value, max, label, className }: CoverageBarProps): ReactNode {
  const safeMax = Math.max(1, max);
  const percent = Math.min(100, Math.round((value / safeMax) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={cn(
        'h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="h-full rounded-full bg-amber-500 transition-[width]"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
