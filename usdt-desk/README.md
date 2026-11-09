# USDT Desk (deployable core)
1. `npm install && npm test` (engine tests)
2. Deploy to Vercel (`vercel`); then open `/api/p2p?tradeType=SELL` and `/api/p2p?tradeType=BUY`.
3. Send the raw JSON of one response back so the normalizer (ad -> merchant row) can be written against the real schema.
Ads are QUOTED only. Confirm each order manually on Binance. No trading, no custody.
