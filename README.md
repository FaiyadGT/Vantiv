# VANTIV

AI-powered market intelligence, working for you.

VANTIV is being built as an AI research and monitoring agent for stocks, markets, company news, and financial events. This repository is the Phase 1 foundation: a React + TypeScript dashboard, FastAPI service, PostgreSQL watchlist storage, Redis service, and Docker Compose environment.

## View the platform

With Docker Desktop running:

```sh
docker compose up --build
```

Open <http://localhost:5173>. The API is available at <http://localhost:8000> and its interactive documentation at <http://localhost:8000/docs>.

For frontend-only work, run `npm install` then `npm run dev`. Start the API and its PostgreSQL/Redis services separately for health and watchlist persistence. The Vite development server proxies `/api` to `http://localhost:8000` by default; set `API_PROXY_TARGET` to override it.

## Current foundation

- Responsive market intelligence dashboard with overview, watchlist, market pulse, insight, and agent activity panels.
- Watchlist create, list, and delete API backed by PostgreSQL.
- Health endpoint reports API, database, and Redis availability.
- Docker Compose provisions the web app, FastAPI, PostgreSQL, and Redis.
- The visible market prices, chart, market signal, and agent activity are illustrative sample data. Live financial data, LLM research, background monitoring, alerts, and notifications are later roadmap phases.

## API

- `GET /api/health`
- `GET /api/watchlist`
- `POST /api/watchlist` with `{ "symbol": "NVDA", "company_name": "NVIDIA Corporation" }`
- `DELETE /api/watchlist/{symbol}`

## Stack

React, TypeScript, Tailwind CSS, Python, FastAPI, PostgreSQL, Redis, and Docker.
