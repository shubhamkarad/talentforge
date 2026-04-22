import { motion, useReducedMotion } from 'framer-motion';
import type { ElementType, ReactNode } from 'react';

// Fade-up wrapper — child slides up ~12px while fading in.
// Respects prefers-reduced-motion. Defaults to <div>; pass `as="section"` etc.
// for semantics without extra wrappers.

interface FadeInProps {
  as?: ElementType;
  delay?: number;
  y?: number;
  duration?: number;
  once?: boolean;
  className?: string;
  children?: ReactNode;
}

export function FadeIn({
  as = 'div',
  delay = 0,
  y = 12,
  duration = 0.5,
  once = true,
  className,
  children,
}: FadeInProps) {
  const reduce = useReducedMotion();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp = motion(as as any);

  return (
    <Comp
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once, margin: '-40px' }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </Comp>
  );
}
