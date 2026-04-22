import { useEffect, useRef, useState } from 'react';
import { useInView, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

// Animated number that counts up from 0 to `value` when it enters the viewport.
// Uses a spring for a subtle overshoot-then-settle feel. Respects reduced-motion
// (jumps straight to the final number).

interface CountUpProps {
  value: number;
  duration?: number;
  format?: (v: number) => string;
  className?: string;
}

export function CountUp({
  value,
  duration = 1.2,
  format = (v) => Math.round(v).toLocaleString(),
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });
  const reduce = useReducedMotion();

  const mv = useMotionValue(0);
  const spring = useSpring(mv, {
    duration: duration * 1000,
    bounce: 0,
  });

  const [display, setDisplay] = useState<string>(format(reduce ? value : 0));

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(format(value));
      return;
    }
    mv.set(value);
  }, [inView, value, reduce, mv, format]);

  useEffect(() => {
    return spring.on('change', (v) => setDisplay(format(v)));
  }, [spring, format]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
