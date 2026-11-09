import { describe, it, expect } from 'vitest';
import { loop, maxSize, type Params } from './engine';
const P: Params = { sell: 74.78, usdBuy: 72, usdSell: 73, buy: 74.33, feePct: 0, fixed: 0 };
describe('100 USDT example', () => {
  const r = loop(100, P);
  it('steps', () => {
    expect(r.m1).toBeCloseTo(7478, 2); expect(r.usd).toBeCloseTo(103.86, 2);
    expect(r.m2).toBeCloseTo(7581.86, 2); expect(r.f).toBeCloseTo(102.0, 1); expect(r.gross).toBeCloseTo(2.0, 1);
  });
  it('fixed costs', () => expect(loop(100, { ...P, fixed: 74.33 }).net).toBeCloseTo(r.gross - 1, 6));
  it('percentage fees', () => expect(loop(100, { ...P, feePct: 1 }).net).toBeCloseTo(r.gross - 1, 6));
  it('break-even rate gives zero net', () => {
    const q = { ...P, fixed: 74.33 }; expect(loop(100, { ...q, usdSell: loop(100, q).be }).net).toBeCloseTo(0, 9);
  });
  it('min profitable size gives zero net', () => {
    const q = { ...P, fixed: 74.33 }; expect(loop(loop(100, q).min, q).net).toBeCloseTo(0, 9);
  });
  it('loss case', () => expect(loop(100, { ...P, usdSell: 71 }).net).toBeLessThan(0));
});
describe('limits', () => {
  it('83 USDT buy liquidity caps the trade', () => {
    const m = maxSize({ liq: 109679 }, { liq: 83 }, P); expect(m).toBeCloseTo(83 / loop(1, P).ratio, 6); expect(m).toBeLessThan(500);
  });
  it('sell limit in MZN', () => expect(maxSize({ liq: 109679 }, {}, P)).toBeCloseTo(109679 / 74.78, 6));
  it('no limits -> Infinity', () => expect(maxSize({}, {}, P)).toBe(Infinity));
});
