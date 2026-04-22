import { motion, useReducedMotion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { cn } from '../../lib/utils';

// Swipe-pill theme toggle. Parent supplies current mode + setter.
//
// Two pips (sun / moon) sit on a track; the active one is highlighted by a
// sliding pill behind it. Clicking either icon jumps to that mode. Styling
// keys off our warm-amber palette.
//
// Deliberately kept mode-binary (light / dark) — "system" is still supported
// by the provider, but the toggle only offers the two explicit choices to
// keep the UI unambiguous.

type Mode = 'light' | 'dark';

export function ThemeToggle({
  mode,
  onChange,
  className,
}: {
  mode: Mode;
  onChange: (next: Mode) => void;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn(
        'border-border bg-muted/60 relative inline-flex h-8 items-center rounded-full border p-1',
        className,
      )}
    >
      {/* Sliding indicator */}
      <motion.span
        aria-hidden
        layout={!reduce}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={cn(
          'bg-primary absolute top-1 h-6 w-6 rounded-full shadow-sm',
          mode === 'light' ? 'left-1' : 'left-[calc(100%-28px)]',
        )}
      />
      <button
        type="button"
        role="radio"
        aria-checked={mode === 'light'}
        onClick={() => onChange('light')}
        className={cn(
          'relative z-10 grid size-6 place-items-center rounded-full transition-colors',
          mode === 'light' ? 'text-primary-foreground' : 'text-muted-foreground',
        )}
      >
        <Sun className="size-3.5" />
        <span className="sr-only">Light</span>
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={mode === 'dark'}
        onClick={() => onChange('dark')}
        className={cn(
          'relative z-10 grid size-6 place-items-center rounded-full transition-colors',
          mode === 'dark' ? 'text-primary-foreground' : 'text-muted-foreground',
        )}
      >
        <Moon className="size-3.5" />
        <span className="sr-only">Dark</span>
      </button>
    </div>
  );
}
