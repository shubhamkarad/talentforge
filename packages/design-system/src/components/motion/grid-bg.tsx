import { cn } from '../../lib/utils';

// Subtle grid background — faint border-colored lines on a transparent
// backdrop. Fades out radially toward the edges. Drop into a `relative`
// parent as the first child so content sits on top.
export function GridBg({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 -z-10',
        '[background-image:linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)]',
        '[background-size:48px_48px]',
        '[mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]',
        'opacity-40',
        className,
      )}
    />
  );
}
