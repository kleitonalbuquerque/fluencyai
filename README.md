# FluencyAI

SaaS web app for language learning with FastAPI, PostgreSQL, Next.js, and JWT auth.

## Local Development

Start PostgreSQL:

```bash
docker run --name fluencyai-postgres \
  -e POSTGRES_USER=fluencyai \
  -e POSTGRES_PASSWORD=fluencyai \
  -e POSTGRES_DB=fluencyai \
  -p 5432:5432 \
  -v fluencyai-postgres-data:/var/lib/postgresql/data \
  -d postgres:16-alpine
```

Backend:

```bash
cd backend
python3 -m venv .venv
.venv/bin/python -m pip install -e '.[dev]'
cp .env.example .env
.venv/bin/python -m alembic upgrade head
.venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev -- --hostname 127.0.0.1 --port 3000
```

## Checks

```bash
cd backend && .venv/bin/python -m pytest
cd frontend && npm test
cd frontend && npm run build
```
