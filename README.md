# Greenhouse Monitor
A lightweight monitoring dashboard built with Next.js App Router.

A small Next.js App Router dashboard for ingesting greenhouse sensor readings, storing them in PostgreSQL with Prisma, and showing current sensor health, alerts, connection status, and 30-minute temperature and humidity trends.

## Setup

```bash
npm install
cp .env.example .env
```

Set `DATABASE_URL` to a PostgreSQL connection string. For Supabase, use a direct database URL for migrations and the normal runtime connection string for the app.

```bash
npm run prisma:generate
npm run prisma:migrate
```

## Environment Variables

`DATABASE_URL`
PostgreSQL connection string used by Prisma.

## Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

In a second terminal, run the simulator:

```bash
node simulator.js
```

The simulator posts to `http://localhost:3000/api/ingest` by default.

## Deployment

Deploy the Next.js app (e.g., Vercel) with `DATABASE_URL` configured.

Run Prisma migrations against the production database:

```bash
npx prisma migrate deploy
```

To point the simulator at a deployed app:

```bash
$env:INGEST_URL="https://your-app.example.com/api/ingest"
node simulator.js
```

## Architecture Decisions

Next.js App Router keeps the API and dashboard in one small application. Prisma and PostgreSQL provide durable relational storage, unique sensor identity by `deviceId`, transactional ingest, and indexes for recent readings and alerts.

The server layer owns ingestion, dashboard aggregation, and grouped history. Route handlers stay thin: validate, rate-limit where needed, delegate, and return JSON. Severity is computed once on ingest and stored as a database enum.

Polling is used instead of WebSockets because the simulator sends readings every 2 seconds and a 5-second dashboard refresh is sufficient for this scope. The client uses a recursive timeout so requests cannot overlap, shows "Connection lost. Retrying..." on failure, and clears the warning when polling recovers.

## API Endpoints

`POST /api/ingest`
Accepts sensor readings from the simulator.

`GET /api/dashboard`
Returns current sensor summaries, alert counts, and latest readings.

`GET /api/history`
Returns last 30 minutes of readings grouped per sensor for chart rendering.

`/api/history` returns grouped sensor history for chart-friendly rendering:

```json
{
  "sensors": [
    {
      "deviceId": "sensor-01",
      "location": "north-wing",
      "readings": [
        {
          "recordedAt": "2026-04-20T12:00:00.000Z",
          "temperature": 22,
          "humidity": 55,
          "severity": "normal"
        }
      ]
    }
  ]
}
```

## Behavior

Temperature severity is normal from 18-30 degrees Celsius, warning from 16-18 or 30-32, and critical below 16 or above 32. Humidity severity is normal from 40-70%, warning from 30-40% or 70-80%, and critical below 30% or above 80%. The stored severity is the worst of temperature and humidity.

Sensor connection status is independent of severity:

* `ONLINE`: last seen within 10 seconds
* `STALE`: last seen within 10-30 seconds
* `OFFLINE`: last seen after more than 30 seconds

The dashboard also shows when it last refreshed. If data is older than 10 seconds, it labels the display as potentially stale.

## Tradeoffs

The app has no authentication by design, so `/api/ingest` includes only a lightweight in-memory IP rate limit of about 100 requests per minute. That is useful protection for local/demo deployment, not a distributed production rate limiter.

History remains a 30-minute raw-reading window with a 5,000-reading cap. The query preserves the newest readings and sorts them ascending before chart rendering. Chart rows normalize timestamps into 2-second buckets to align readings produced by the simulator tick. Larger deployments should use server-side bucketing or materialized summaries.

No auth keeps the project focused on ingestion and monitoring. A real shared deployment would need authentication, device credentials, and stricter network controls.

Displayed times use UTC consistently to avoid server/browser timezone mismatches during hydration.

## Tests

```bash
npm test
```

The test suite covers severity boundaries, ingest validation, grouped history shaping, chart row normalization, and last-seen timestamp max logic.

## AI Usage

This project was implemented with AI assistance for scaffolding, remediation, code generation, and documentation. The implementation was constrained to the requested stack and verified with Prisma generation, tests, lint, and production build.

## If I Had 5 More Hours

I would add WebSocket or database realtime updates, configurable alert thresholds, anomaly detection for unusual sensor drift, a per-sensor detail view, and integration tests against a disposable PostgreSQL database.
