import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

// Wraps a card/tile and makes it lift + tilt slightly on hover. Pass any
// class names through — we just add the motion behavior.
export function HoverLift({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -4, rotateX: 2, rotateY: -1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ transformStyle: 'preserve-3d' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
