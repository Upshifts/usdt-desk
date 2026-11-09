export interface Params { sell: number; usdBuy: number; usdSell: number; buy: number; feePct: number; fixed: number }
export interface Result { m1: number; usd: number; m2: number; f: number; gross: number; pct: number; fx: number; net: number; ratio: number; roi: number; netMZN: number; netUSD: number; be: number; min: number }

/** Sequential loop: sell USDT -> MZN -> buy USD -> sell USD -> MZN -> buy USDT. feePct is total % over both Binance legs; fixed is MZN. */
export function loop(U: number, p: Params): Result {
  const m1 = U * p.sell, usd = m1 / p.usdBuy, m2 = usd * p.usdSell, f = m2 / p.buy;
  const gross = f - U, pct = (U * p.feePct) / 100, fx = p.fixed / p.buy, net = gross - pct - fx;
  const ratio = f / U, per = ratio - 1 - p.feePct / 100;
  return { m1, usd, m2, f, gross, pct, fx, net, ratio, roi: (net / U) * 100, netMZN: net * p.buy, netUSD: (net * p.buy) / p.usdSell,
    be: ((U + pct + fx) * p.buy) / usd, min: per > 0 ? fx / per : Infinity };
}

export interface Limit { liq?: number; max?: number }
/** Largest starting USDT that fits every limit. Sell liquidity is MZN; buy liquidity is USDT; dealer max is USD. */
export function maxSize(s: Limit, b: Limit, p: Params, dealerMaxUSD = 0): number {
  const ratio = (p.usdSell / p.usdBuy) * (p.sell / p.buy), c: number[] = [];
  if (s.liq) c.push(s.liq / p.sell);
  if (s.max) c.push(s.max);
  if (b.liq) c.push(b.liq / ratio);
  if (b.max) c.push(b.max / ratio);
  if (dealerMaxUSD) c.push((dealerMaxUSD * p.usdBuy) / p.sell);
  return c.length ? Math.min(...c) : Infinity;
}
