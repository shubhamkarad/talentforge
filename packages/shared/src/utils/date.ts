export function formatDate(
  value: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
}

// Buckets used for coarse "time ago" display.
const RELATIVE_BUCKETS: Array<{ seconds: number; label: (n: number) => string }> = [
  { seconds: 60,            label: () => 'just now' },
  { seconds: 60 * 60,       label: (n) => `${Math.floor(n / 60)}m ago` },
  { seconds: 60 * 60 * 24,  label: (n) => `${Math.floor(n / 3600)}h ago` },
  { seconds: 60 * 60 * 24 * 7,   label: (n) => `${Math.floor(n / 86400)}d ago` },
  { seconds: 60 * 60 * 24 * 30,  label: (n) => `${Math.floor(n / (86400 * 7))}w ago` },
  { seconds: 60 * 60 * 24 * 365, label: (n) => `${Math.floor(n / (86400 * 30))}mo ago` },
];

export function formatRelativeTime(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  for (const bucket of RELATIVE_BUCKETS) {
    if (diffSec < bucket.seconds) return bucket.label(diffSec);
  }
  return formatDate(d);
}
