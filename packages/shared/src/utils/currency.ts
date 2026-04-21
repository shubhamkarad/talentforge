import type { SalaryPeriod } from '../types/enums';

const PERIOD_SUFFIX: Record<SalaryPeriod, string> = {
  hour: '/hr',
  month: '/mo',
  year: '/yr',
};

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSalaryRange(
  min: number | null | undefined,
  max: number | null | undefined,
  currency = 'USD',
  period: SalaryPeriod = 'year',
): string {
  if (!min && !max) return 'Salary not specified';
  const suffix = PERIOD_SUFFIX[period];

  if (min && max) {
    if (min === max) return `${formatCurrency(min, currency)}${suffix}`;
    return `${formatCurrency(min, currency)} – ${formatCurrency(max, currency)}${suffix}`;
  }
  if (min) return `From ${formatCurrency(min, currency)}${suffix}`;
  if (max) return `Up to ${formatCurrency(max, currency)}${suffix}`;
  return 'Salary not specified';
}
