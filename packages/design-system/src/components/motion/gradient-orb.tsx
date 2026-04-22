import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';

// A slow-moving, soft-focus gradient blob for hero backgrounds.
// Place inside a `relative overflow-hidden` parent; it's aria-hidden and
// pointer-events-none so it never interferes with real content.

interface GradientOrbProps {
  className?: string;
  // Size class (any Tailwind w/h works). Default is a huge blob.
  size?: string;
  // From/to gradient endpoints as HSL color strings (match theme tokens).
  from?: string;
  via?: string;
  to?: string;
}

export function GradientOrb({
  className,
  size = 'w-[700px] h-[700px]',
  from = 'hsl(var(--primary) / 0.35)',
  via = 'hsl(var(--accent) / 0.2)',
  to = 'transparent',
}: GradientOrbProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className={cn('pointer-events-none absolute -z-10 rounded-full blur-3xl', size, className)}
      style={{
        background: `radial-gradient(circle at center, ${from}, ${via}, ${to})`,
      }}
      animate={
        reduce
          ? undefined
          : {
              scale: [1, 1.08, 1],
              x: ['0%', '3%', '-2%', '0%'],
              y: ['0%', '-4%', '2%', '0%'],
            }
      }
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}
