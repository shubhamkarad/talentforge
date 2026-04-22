import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Button, type ButtonProps } from '../ui/button';

// Button with a diagonal shine sweep on hover. Just adds a ::before overlay
// to the base Button — no extra wrapper — so `asChild` still works and
// children keep their flex layout.
export const ShineButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => (
    <Button
      ref={ref}
      className={cn(
        'relative overflow-hidden',
        'before:pointer-events-none before:absolute before:inset-0 before:-translate-x-full before:skew-x-12',
        'before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent',
        'before:transition-transform before:duration-700 before:ease-out',
        'hover:before:translate-x-full',
        className,
      )}
      {...props}
    />
  ),
);
ShineButton.displayName = 'ShineButton';
