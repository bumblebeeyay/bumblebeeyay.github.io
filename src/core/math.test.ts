import { describe, expect, it } from 'vitest';
import { approach, clamp, smoothingFactor } from './math';
import { vec2 } from './vec2';

describe('clamp', () => {
  it('keeps values inside the range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });
});

describe('smoothingFactor', () => {
  it('equals the rate for exactly one 60 fps frame', () => {
    expect(smoothingFactor(0.2, 1000 / 60)).toBeCloseTo(0.2);
  });

  it('gives the same result for two short frames as for one long one', () => {
    const rate = 0.1;
    const twoHalfFrames = 1 - (1 - smoothingFactor(rate, 1000 / 120)) ** 2;
    expect(twoHalfFrames).toBeCloseTo(smoothingFactor(rate, 1000 / 60));
  });

  it('handles the 0 and 1 edge rates', () => {
    expect(smoothingFactor(0, 16)).toBe(0);
    expect(smoothingFactor(1, 16)).toBe(1);
  });
});

describe('approach', () => {
  it('moves part of the way toward the target', () => {
    const next = approach(vec2(0, 0), vec2(100, 50), 0.5, 1000 / 60);
    expect(next.x).toBeCloseTo(50);
    expect(next.y).toBeCloseTo(25);
  });
});
