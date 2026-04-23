import * as React from 'react';
import { cn } from '../../lib/utils';

// Intentionally a styled NATIVE <select>, not the Radix dropdown widget.
// Native selects give us mobile keyboards, accessibility, and form validation
// for free; we can swap for a Radix-backed combobox later if needed.
//
// Implementation notes:
// - `appearance-none` strips the browser's default caret (inconsistent spacing
//   across Chrome / Safari / Firefox) and we paint our own SVG chevron via an
//   inline `style` (not a Tailwind arbitrary value — parsers sometimes mangle
//   the embedded URL, and the chevron just vanishes).
// - `[color-scheme:light_dark]` tells the browser to render the native
//   options dropdown in whichever scheme the document is using, so the popup
//   doesn't appear white-on-light while the app is in dark mode.

const CHEVRON_LIGHT =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, style, children, ...props }, ref) => (
  <select
    ref={ref}
    style={{
      backgroundImage: CHEVRON_LIGHT,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 0.75rem center',
      backgroundSize: '1rem 1rem',
      ...style,
    }}
    className={cn(
      'border-input bg-background flex h-9 w-full appearance-none rounded-md border py-1 pr-10 pl-3 text-sm shadow-sm',
      // Make the native options popup match the app's theme.
      '[color-scheme:light] dark:[color-scheme:dark]',
      'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';
