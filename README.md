# Ascintra.ai Monorepo

Monorepo with a Next.js 14 frontend and a FastAPI backend with mock endpoints. A proxy route in the frontend exposes the backend under `/api/*` for easy data loading.

## Structure
- `frontend/` — Next.js 14 + TypeScript app (App Router, Tailwind, Radix).
- `backend/` — FastAPI app exposing APIs.
- `backend/alembic/` — Alembic migrations for Postgres (ORM-managed).
- `docker-compose.yml` — Runs both services together.
- `compose.sh` — Helper script to build and start via Docker Compose.

## Quick Start (Docker Compose)
- Start services: `./compose.sh`
- Frontend: http://localhost:3000
- Backend: http://localhost:8000 (health: `/healthz`, APIs under `/api/*`)
- ArangoDB: expected to be running on the host at http://localhost:8529 (we point to it from the backend using `host.docker.internal`).
- Postgres (Compose): `postgres:5432` (db/user/pass: `ascintra`)

The frontend proxies any `/api/*` requests to the backend (configured by `BACKEND_URL`; Compose sets it to `http://backend:8000`). In the browser, call relative paths like `/api/admin/dashboard`.
Compose wires the backend to an existing ArangoDB running on your host via `ARANGO_URL=http://host.docker.internal:8529`. Set `ARANGO_DB`, `ARANGO_USER`, and `ARANGO_PASSWORD` to match your instance. If the `fix`/`inventory` collections are absent, the backend returns mock data.

## Postgres + Alembic
- Compose includes `postgres`. The backend container runs `alembic upgrade head` on startup.
- Initial Alembic migration creates a generic `cloud_accounts` table that supports AWS and GCP:
  - Common: `provider`, `account_identifier`, `name`, `primary_region`, `connection_status`, timestamps
  - AWS: `aws_role_arn`, `aws_external_id`
  - GCP: `gcp_project_number`, `gcp_sa_email`, `credentials_json`
  - Settings: `discovery_enabled`, `discovery_options` (jsonb)
- Run Alembic manually (inside backend container):
  - `docker compose run --rm backend alembic revision -m "desc" --autogenerate`
  - `docker compose run --rm backend alembic upgrade head`
  - Alembic reads the DB URL from FastAPI settings; environment is set in Compose.

## Accounts API
- Test connection (stubbed success): `POST /api/accounts/test-connection` with `{ provider: 'aws'|'gcp', account_identifier, aws_role_arn? }` → `{ ok: true }`.
- Create account: `POST /api/accounts` with body fields (provider, account_identifier, name, primary_region, and provider-specific). Saves to Postgres.
- List accounts: `GET /api/accounts`.

## Local Development (without Docker)
- Backend
  - Create venv and install: `python -m venv .venv && source .venv/bin/activate && pip install -r backend/requirements.txt`
  - Run: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` from `backend/`
- Frontend
  - From `frontend/`: `pnpm install` then `pnpm dev`
  - Set `BACKEND_URL=http://localhost:8000` in your shell or a `.env.local` (server-only var) for the proxy route.

## FastAPI Mock APIs
Backend provides separate endpoints for each page under `/api/*` (e.g. `/api/admin/dashboard`, `/api/tenant/overview`, `/api/tenant/inventory`). Responses include page metadata and mock data. See `backend/app/main.py:1`.

## Frontend API Proxy
`frontend/app/api/[...proxy]/route.ts:1` forwards any `/api/*` requests to the backend. Use relative URLs from UI code to avoid CORS and environment differences.

## Production
- Build images and run: `docker compose up --build -d`
- Frontend listens on `:3000`, backend on `:8000`.

## Notes
- Next.js build ignores ESLint/TS errors per `next.config.*`.
- Prefer pnpm for the frontend (lockfile present).
- Backend optional ArangoDB:
  - Configure via env: `ARANGO_URL`, `ARANGO_DB`, `ARANGO_USER`, `ARANGO_PASSWORD`, `ARANGO_INVENTORY_COLLECTION` (default `inventory`).
  - If not set or collection missing, backend returns mock data.
  - Inventory endpoints with DB support: `/api/tenant/inventory`, `/api/tenant/inventory/details` (aliases: `/api/inventory`, `/api/inventory/details`).
  - For EC2/EBS protection view, backend queries `ARANGO_FIX_COLLECTION` (default `fix`) with an AQL pre-aggregation of snapshots and volumes.
