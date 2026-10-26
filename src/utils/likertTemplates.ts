/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LikertConfig, LikertOption, LikertTemplateKey } from '../types/survey';

export const PREDEFINED_LIKERT_TEMPLATES: Record<LikertTemplateKey, LikertConfig> = {
  agreement: {
    points: 5,
    template: 'agreement',
    allowNeutral: true,
    options: [
      { value: 1, label: 'Strongly Disagree', shortLabel: 'SD', color: '#f43f5e' },
      { value: 2, label: 'Disagree', shortLabel: 'D', color: '#fb923c' },
      { value: 3, label: 'Neutral / Undecided', shortLabel: 'N', color: '#94a3b8' },
      { value: 4, label: 'Agree', shortLabel: 'A', color: '#38bdf8' },
      { value: 5, label: 'Strongly Agree', shortLabel: 'SA', color: '#10b981' },
    ],
  },
  satisfaction: {
    points: 5,
    template: 'satisfaction',
    allowNeutral: true,
    options: [
      { value: 1, label: 'Very Dissatisfied', shortLabel: 'VD', color: '#f43f5e' },
      { value: 2, label: 'Dissatisfied', shortLabel: 'D', color: '#fb923c' },
      { value: 3, label: 'Neutral', shortLabel: 'N', color: '#94a3b8' },
      { value: 4, label: 'Satisfied', shortLabel: 'S', color: '#38bdf8' },
      { value: 5, label: 'Very Satisfied', shortLabel: 'VS', color: '#10b981' },
    ],
  },
  frequency: {
    points: 5,
    template: 'frequency',
    allowNeutral: true,
    options: [
      { value: 1, label: 'Never', shortLabel: 'Nev', color: '#f43f5e' },
      { value: 2, label: 'Rarely', shortLabel: 'Rar', color: '#fb923c' },
      { value: 3, label: 'Sometimes', shortLabel: 'Some', color: '#94a3b8' },
      { value: 4, label: 'Often', shortLabel: 'Oft', color: '#38bdf8' },
      { value: 5, label: 'Always', shortLabel: 'Alw', color: '#10b981' },
    ],
  },
  importance: {
    points: 5,
    template: 'importance',
    allowNeutral: true,
    options: [
      { value: 1, label: 'Not at all Important', shortLabel: 'NI', color: '#f43f5e' },
      { value: 2, label: 'Slightly Important', shortLabel: 'SI', color: '#fb923c' },
      { value: 3, label: 'Moderately Important', shortLabel: 'MI', color: '#94a3b8' },
      { value: 4, label: 'Very Important', shortLabel: 'VI', color: '#38bdf8' },
      { value: 5, label: 'Extremely Important', shortLabel: 'EI', color: '#10b981' },
    ],
  },
  forced: {
    points: 4,
    template: 'forced',
    allowNeutral: false,
    options: [
      { value: 1, label: 'Strongly Disagree', shortLabel: 'SD', color: '#f43f5e' },
      { value: 2, label: 'Disagree', shortLabel: 'D', color: '#fb923c' },
      { value: 3, label: 'Agree', shortLabel: 'A', color: '#38bdf8' },
      { value: 4, label: 'Strongly Agree', shortLabel: 'SA', color: '#10b981' },
    ],
  },
  custom: {
    points: 5,
    template: 'custom',
    allowNeutral: true,
    options: [
      { value: 1, label: 'Poor', shortLabel: '1', color: '#f43f5e' },
      { value: 2, label: 'Fair', shortLabel: '2', color: '#fb923c' },
      { value: 3, label: 'Average', shortLabel: '3', color: '#94a3b8' },
      { value: 4, label: 'Good', shortLabel: '4', color: '#38bdf8' },
      { value: 5, label: 'Excellent', shortLabel: '5', color: '#10b981' },
    ],
  },
};

export const SEVEN_POINT_AGREEMENT: LikertConfig = {
  points: 7,
  template: 'agreement',
  allowNeutral: true,
  options: [
    { value: 1, label: 'Strongly Disagree', shortLabel: 'SD', color: '#e11d48' },
    { value: 2, label: 'Disagree', shortLabel: 'D', color: '#f97316' },
    { value: 3, label: 'Somewhat Disagree', shortLabel: 'SwD', color: '#fbbf24' },
    { value: 4, label: 'Neither Agree nor Disagree', shortLabel: 'N', color: '#94a3b8' },
    { value: 5, label: 'Somewhat Agree', shortLabel: 'SwA', color: '#38bdf8' },
    { value: 6, label: 'Agree', shortLabel: 'A', color: '#2563eb' },
    { value: 7, label: 'Strongly Agree', shortLabel: 'SA', color: '#10b981' },
  ],
};

export interface LikertStatistics {
  count: number;
  mean: number;
  median: number;
  variance: number;
  standardDeviation: number;
  favorablePercent: number; // Top 2 Box
  neutralPercent: number;
  unfavorablePercent: number; // Bottom 2 Box
  distribution: Record<number, number>; // value -> count
}

export function calculateLikertStats(values: number[], maxPoints: number = 5): LikertStatistics {
  if (!values.length) {
    return {
      count: 0,
      mean: 0,
      median: 0,
      variance: 0,
      standardDeviation: 0,
      favorablePercent: 0,
      neutralPercent: 0,
      unfavorablePercent: 0,
      distribution: {},
    };
  }

  const count = values.length;
  const sum = values.reduce((acc, curr) => acc + curr, 0);
  const mean = Number((sum / count).toFixed(2));

  // Median
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(count / 2);
  const median = count % 2 !== 0 ? sorted[mid] : Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));

  // Variance & Standard Deviation
  const varianceSum = values.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0);
  const variance = Number((varianceSum / count).toFixed(2));
  const standardDeviation = Number(Math.sqrt(variance).toFixed(2));

  // Distribution
  const distribution: Record<number, number> = {};
  for (let i = 1; i <= maxPoints; i++) {
    distribution[i] = 0;
  }
  values.forEach(v => {
    distribution[v] = (distribution[v] || 0) + 1;
  });

  // Favorable / Unfavorable based on scale
  let unfavorable = 0;
  let neutral = 0;
  let favorable = 0;

  values.forEach(v => {
    if (maxPoints === 5) {
      if (v <= 2) unfavorable++;
      else if (v === 3) neutral++;
      else favorable++;
    } else if (maxPoints === 7) {
      if (v <= 3) unfavorable++;
      else if (v === 4) neutral++;
      else favorable++;
    } else if (maxPoints === 4) {
      if (v <= 2) unfavorable++;
      else favorable++;
    } else {
      const midpoint = (maxPoints + 1) / 2;
      if (v < midpoint) unfavorable++;
      else if (v === midpoint) neutral++;
      else favorable++;
    }
  });

  return {
    count,
    mean,
    median,
    variance,
    standardDeviation,
    favorablePercent: Math.round((favorable / count) * 100),
    neutralPercent: Math.round((neutral / count) * 100),
    unfavorablePercent: Math.round((unfavorable / count) * 100),
    distribution,
  };
}
