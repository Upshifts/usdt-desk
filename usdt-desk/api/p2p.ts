// Vercel serverless function: GET /api/p2p?tradeType=SELL|BUY&limit=10
// Read-only proxy to Binance's public P2P ad-list endpoint (USDT/MZN).
// Returns the RAW upstream JSON so we can see the real schema before writing a normalizer.
import type { VercelRequest, VercelResponse } from '@vercel/node';

const BASE = 'https://www.binance.com/bapi/c2c/v1/public/c2c/agent/ad-list';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const tradeType = String(req.query.tradeType ?? '').toUpperCase();
  if (tradeType !== 'BUY' && tradeType !== 'SELL') {
    return res.status(400).json({ error: 'tradeType must be BUY or SELL' });
  }
  const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? '10'), 10) || 10, 1), 20);
  const q = new URLSearchParams({ fiat: 'MZN', asset: 'USDT', tradeType, limit: String(limit) });
  // Optional payment filter, e.g. ?method=EMOLA (one method per request; identifier names come from Binance, see raw response)
  const method = String(req.query.method ?? '');
  if (/^[A-Za-z0-9_-]{1,40}$/.test(method)) q.append('tradeMethodIdentifiers', method);
  try {
    const r = await fetch(`${BASE}?${q}`, { headers: { 'User-Agent': 'usdt-desk/0.1 (personal rate viewer)' } });
    const raw = await r.json().catch(() => null);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(r.ok ? 200 : 502).json({
      fetchedAt: new Date().toISOString(),
      upstreamStatus: r.status,
      status: 'QUOTED_NOT_VERIFIED', // an advertised ad is never "executable" until you confirm it manually
      raw,
    });
  } catch {
    return res.status(502).json({ error: 'upstream fetch failed' });
  }
}
