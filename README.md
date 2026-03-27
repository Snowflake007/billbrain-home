# BillBrain Home

BillBrain Home is a freemium AI utility companion for households and a vertical growth channel for Azility.

The idea is simple: give homeowners, renters, and small landlords a phone app that helps them understand utility changes without manually tracking bills every month. The long-term product vision is an app that connects to utility and contextual data sources, monitors usage in the background, and sends clear push notifications, weekly check-ins, and monthly reports when something looks off.

For Azility, BillBrain Home is more than a consumer app. It is a household entry point into the same vertical logic Azility already uses at the enterprise level: collect utility data, detect anomalies, explain what changed, and recommend action.

## Why this exists

Azility’s challenge is growth without losing vertical focus.

BillBrain Home solves that by turning a real household problem into a business advantage for Azility:

- People often do not know why their electricity, gas, or water bill suddenly changed.
- Most utility portals show charts and PDFs, but not real explanations.
- A free product that solves this problem can increase awareness of Azility, create qualified leads, and strengthen Azility’s long-term AI capabilities through optional user opt-in data contribution.

## Product vision

BillBrain Home is designed as a **phone app with push notifications**, not just a dashboard.

It will:

- connect to utility and contextual APIs so the user does not have to enter data manually
- normalize billing and usage data across time
- detect abnormal changes
- explain likely causes in plain language
- forecast likely next-bill ranges
- send weekly health checks, monthly summaries, and alert-based push notifications
- later connect bill anomalies to home systems such as heat pumps, water heaters, thermostats, and EV charging

## Current MVP

This repository contains the MVP prototype for that vision.

The MVP focuses on the core product loop:

1. upload a utility bill image or PDF
2. extract key information from the bill
3. normalize the result into a clean structure
4. analyze the bill for unusual changes
5. generate a plain-language explanation, forecast, and action-oriented next steps

The current prototype demonstrates the most important part of the product: turning raw utility data into something understandable and useful.

## What the MVP currently shows

- bill upload flow
- AI-assisted bill extraction
- normalized bill data
- anomaly verdict
- likely-cause explanation
- next-bill forecast
- action-plan output
- enterprise bridge to Azility

## Technical direction

BillBrain Home follows the same logic that makes Azility valuable:

**ingest -> normalize -> detect -> explain -> notify**

### Architecture

- **Connector layer:** designed for utility APIs, weather APIs, email bill ingestion, and later MCP-style connectors
- **Ingestion and normalization layer:** converts different bill formats into one usable internal model
- **Detection layer:** identifies spikes, drift, and suspicious patterns
- **Forecasting layer:** estimates likely next-bill ranges
- **Explanation layer:** turns signals into plain-language user guidance
- **Notification layer:** supports recurring reports and push-based alerts

### MVP implementation

The current MVP uses:

- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **Gemini Flash** for bill analysis / extraction
- **weather context** to support more realistic explanations
- app logic for anomaly scoring, forecasting, and action guidance

## Why this matters for Azility

BillBrain Home supports Azility in three ways:

1. **Marketing:** a free product that solves a real problem can bring more people into Azility’s orbit
2. **Lead generation:** users who move from one home to multiple properties or sites become natural Azility prospects
3. **AI training value:** with explicit opt-in, anonymized usage patterns can help improve future anomaly detection and recommendations

## Run locally

```bash
npm install
npm run dev
```
