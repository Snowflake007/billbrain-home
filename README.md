# BillBrain Home

BillBrain Home is a mobile-first MVP for the Fluent / Azility challenge.

It helps a user upload a utility bill, spot abnormal changes, explain the most likely causes in plain language, forecast the next bill, and recommend what to do next.

## MVP focus

This prototype is intentionally narrow:
- one home
- manual inputs + demo upload flow
- one strong AI feature: anomaly explanation + action plan
- clean demo path for the presentation video

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- optional AI call with fallback heuristic logic

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Demo plan

Use one of the built-in demo scenarios:
- winter heating spike
- possible water leak
- fee jump

Then click **Analyze bill** and walk through:
1. anomaly score
2. likely causes
3. next-bill forecast
4. action plan
5. enterprise bridge to Azility
