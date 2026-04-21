import { MATCH_SCORE_BANDS } from '../constants';

export type MatchBand = 'excellent' | 'good' | 'fair' | 'low';

export function bandOf(score: number): MatchBand {
  if (score >= MATCH_SCORE_BANDS.excellent) return 'excellent';
  if (score >= MATCH_SCORE_BANDS.good)      return 'good';
  if (score >= MATCH_SCORE_BANDS.fair)      return 'fair';
  return 'low';
}

const LABELS: Record<MatchBand, string> = {
  excellent: 'Excellent match',
  good:      'Good match',
  fair:      'Fair match',
  low:       'Low match',
};

const TEXT_COLORS: Record<MatchBand, string> = {
  excellent: 'text-emerald-600',
  good:      'text-sky-600',
  fair:      'text-amber-600',
  low:       'text-rose-600',
};

const BG_COLORS: Record<MatchBand, string> = {
  excellent: 'bg-emerald-100',
  good:      'bg-sky-100',
  fair:      'bg-amber-100',
  low:       'bg-rose-100',
};

export function formatScore(score: number): string {
  return `${Math.round(score)}%`;
}

export function scoreLabel(score: number): string {
  return LABELS[bandOf(score)];
}

export function scoreTextColor(score: number): string {
  return TEXT_COLORS[bandOf(score)];
}

export function scoreBgColor(score: number): string {
  return BG_COLORS[bandOf(score)];
}
