import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import { cn } from '../../lib/utils';

// Circular progress ring that animates from 0 → value when it enters view.
// Colors track the match-score bands (green / sky / amber / rose).
//
// Usage:
//   <ScoreRing value={72} />           // default 80px
//   <ScoreRing value={88} size={128}   // bigger
//              label="match" />

interface ScoreRingProps {
  value: number; // 0–100
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

function bandTextClass(v: number): string {
  if (v >= 85) return 'text-emerald-600';
  if (v >= 70) return 'text-sky-600';
  if (v >= 50) return 'text-amber-600';
  return 'text-rose-600';
}

function bandStrokeClass(v: number): string {
  if (v >= 85) return 'stroke-emerald-500';
  if (v >= 70) return 'stroke-sky-500';
  if (v >= 50) return 'stroke-amber-500';
  return 'stroke-rose-500';
}

export function ScoreRing({ value, size = 80, strokeWidth = 8, label, className }: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const ref = useRef<SVGSVGElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '-10px' });
  const reduce = useReducedMotion();

  // Arc geometry
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animate progress 0 → clamped when in view.
  const mv = useMotionValue(reduce ? clamped : 0);
  const spring = useSpring(mv, { stiffness: 90, damping: 20 });
  const dashOffset = useTransform(spring, (v) => circumference * (1 - v / 100));

  // Also drive a displayed integer so the label counts up alongside the arc.
  const [display, setDisplay] = useState<number>(reduce ? clamped : 0);

  useEffect(() => {
    if (inView) mv.set(clamped);
  }, [inView, clamped, mv]);

  useEffect(() => {
    return spring.on('change', (v) => setDisplay(Math.round(v)));
  }, [spring]);

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        {/* progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={bandStrokeClass(clamped)}
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn('text-xl font-semibold tabular-nums', bandTextClass(clamped))}
          style={{ fontSize: size * 0.28 }}
        >
          {display}
        </span>
        {label ? (
          <span
            className="text-muted-foreground text-[9px] tracking-[0.15em] uppercase"
            style={{ fontSize: Math.max(9, size * 0.1) }}
          >
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
