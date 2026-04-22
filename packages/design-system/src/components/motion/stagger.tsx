import { motion, useReducedMotion } from 'framer-motion';
import type { ElementType, ReactNode } from 'react';

// Stagger container: render children wrapped in StaggerItem and they animate
// in one-by-one. Useful for card grids and list pages.

interface StaggerProps {
  as?: ElementType;
  delay?: number;
  step?: number; // seconds between each child
  className?: string;
  children: ReactNode;
}

export function Stagger({ as = 'div', delay = 0, step = 0.06, className, children }: StaggerProps) {
  const reduce = useReducedMotion();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp = motion(as as any);

  return (
    <Comp
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={{
        hidden: {},
        visible: {
          transition: reduce
            ? { staggerChildren: 0 }
            : { staggerChildren: step, delayChildren: delay },
        },
      }}
      className={className}
    >
      {children}
    </Comp>
  );
}

interface StaggerItemProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

export function StaggerItem({ as = 'div', className, children }: StaggerItemProps) {
  const reduce = useReducedMotion();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp = motion(as as any);

  return (
    <Comp
      variants={{
        hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 12 },
        visible: reduce
          ? { opacity: 1 }
          : { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
      }}
      className={className}
    >
      {children}
    </Comp>
  );
}
