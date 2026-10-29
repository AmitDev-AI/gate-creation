import { describe, expect, it } from 'vitest';
import {
  formatBytes,
  formatDuration,
  formatMinutes,
  formatPercent,
  pluralize,
  round2,
} from './format';

describe('round2', () => {
  it('keeps two decimals', () => {
    expect(round2(1.234)).toBe(1.23);
    expect(round2(1.235)).toBe(1.24);
  });

  it('rounds negative marks symmetrically', () => {
    expect(round2(-1 / 3)).toBe(-0.33);
    expect(round2(-2 / 3)).toBe(-0.67);
    expect(round2(-1)).toBe(-1);
  });

  it('handles floating point noise from repeated fractions', () => {
    expect(round2((1 / 3) * 3)).toBe(1);
    expect(round2(-(1 / 3) * 3)).toBe(-1);
  });
});

describe('formatDuration', () => {
  it('clamps negatives to zero', () => {
    expect(formatDuration(-5000)).toBe('00:00');
  });

  it('formats under an hour as mm:ss', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(9_000)).toBe('00:09');
    expect(formatDuration(585_000)).toBe('09:45');
  });

  it('formats an hour or more as h:mm:ss', () => {
    expect(formatDuration(3_600_000)).toBe('1:00:00');
    expect(formatDuration(3_725_000)).toBe('1:02:05');
  });
});

describe('formatMinutes', () => {
  it('uses minutes below an hour and hours above', () => {
    expect(formatMinutes(45)).toBe('45 min');
    expect(formatMinutes(120)).toBe('2 h');
    expect(formatMinutes(90)).toBe('1 h 30 min');
  });
});

describe('formatPercent', () => {
  it('handles non-finite values without printing NaN', () => {
    expect(formatPercent(Number.NaN)).toBe('—');
    expect(formatPercent(0.5)).toBe('50%');
    expect(formatPercent(2 / 3, 1)).toBe('66.7%');
  });
});

describe('pluralize', () => {
  it('switches on exactly one', () => {
    expect(pluralize(1, 'question')).toBe('question');
    expect(pluralize(0, 'question')).toBe('questions');
    expect(pluralize(2, 'answer', 'answers')).toBe('answers');
  });
});

describe('formatBytes', () => {
  it('scales units and never prints NaN', () => {
    expect(formatBytes(null)).toBe('—');
    expect(formatBytes(812)).toBe('812 B');
    expect(formatBytes(14 * 1024)).toBe('14 KB');
    expect(formatBytes(1.4 * 1024 * 1024)).toBe('1.4 MB');
  });
});
