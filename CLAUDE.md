# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FluencyAI is a language-learning SaaS platform (Duolingo-inspired) with an immersion plan, AI chat grounded in a knowledge base, memorization, role play, gamification, and ranking. The backend is FastAPI + PostgreSQL; the frontend is Next.js 15 with the App Router.

## Token-Saving CLI Tools

### RTK — Rust Token Killer

All shell commands should be prefixed with `rtk` to filter verbose output and reduce token usage by 60–90%. The Claude Code hook rewrites commands transparently — e.g. `git status` becomes `rtk git status`.

```bash
rtk gain              # Show cumulative token savings
rtk gain --history    # Command-by-command savings history
rtk discover          # Scan Claude Code history for missed rtk opportunities
rtk proxy <cmd>       # Run a command without filtering (debugging only)
```

> If `rtk gain` fails, check `which rtk` — you may have a different `rtk` binary installed (Rust Type Kit conflict).

### Caveman — Text Compressor

[Caveman](https://github.com/JuliusBrussee/caveman) strips grammatical connectives from prose, significantly reducing token count before sending text to an LLM while preserving factual content.

```bash
caveman compress -f input.md -o output.md   # Compress a file
```

In the backend, `KnowledgeService` automatically runs caveman on knowledge base documents before building the Groq prompt when `CAVEMAN_ENABLED=true` and `CAVEMAN_BIN` points to the installed binary. See `application/ai/knowledge_service.py` for the implementation.

---

## Commands

### Backend (run from `backend/`)

```bash
# Activate virtualenv first
source .venv/bin/activate

# Run server
uvicorn presentation.api.main:app --reload

# Run all tests
pytest

# Run a single test file
pytest tests/test_product_features.py

# Run with coverage
pytest --cov

# Apply migrations
alembic upgrade head

# Generate a new migration
alembic revision --autogenerate -m "describe change"

# Seed the database
python seed_data.py
```

### Frontend (run from `frontend/`)

```bash
npm run dev         # Start dev server on :3000
npm run lint        # ESLint (deve passar antes dos testes)
npm run lint:fix    # Corrigir violações automaticamente
npm test            # Run Vitest tests (single run)
npm run test:watch  # Watch mode
npm run test:coverage
npm run build       # Production build (TypeScript check included)
```

## Quality Checks — Ordem Obrigatória

Execute nesta sequência antes de commitar ou abrir PR:

### Frontend (run from `frontend/`)

```bash
npm audit                # verificar vulnerabilidades de dependências
npm run lint             # ESLint — deve retornar 0 errors
npx tsc --noEmit         # TypeScript sem erros de tipo
npm test                 # 75+ testes passando
```

> `npm audit` pode reportar vulnerabilidades **upstream** do Next.js que requerem `--force` para corrigir (breaking change). Documente mas não force-atualize sem avaliar o impacto.

### Backend (run from `backend/`)

```bash
.venv/bin/ruff check .         # lint Python — deve retornar "All checks passed!"
.venv/bin/ruff check . --fix   # corrigir auto (organização de imports, etc.)
.venv/bin/python -m pytest     # 59+ testes passando
```

## Engineering Mandates

Before every implementation, read `docs/tdd-solid-maintainability-guidelines.md`. Key rules:

- **TDD is required**: write tests before changing production behavior.
- **Clean Architecture boundaries are strict** — no layer may import from a layer above it.
- **No direct `fetch` calls in components** — all network calls belong in `features/*/services`.
- **No business logic in route handlers** — delegate to application services.
- Use exact dependency versions (no `^` ranges).

## Architecture

### Backend — Clean Architecture Layers

```
domain/          Pure entities, business invariants, domain exceptions. No DB, HTTP, or AI imports.
application/     Use cases and orchestration. Depends on repository/service protocols, not ORM models.
infrastructure/  SQLAlchemy models, concrete repositories, JWT, bcrypt, Groq AI client, caveman compression.
presentation/    FastAPI routers, Pydantic schemas, dependency wiring, HTTP error mapping.
```

The entry point is `main.py` → `presentation/api/main.py` which wires three routers:
- `routes/auth.py` — signup, login, refresh, password reset
- `routes/product.py` — learning tracks, immersion plan, AI chat, gamification, ranking, memorization, role play
- `routes/knowledge.py` — knowledge base CRUD (admin-restricted)

Repository protocols live in `application/repositories/`; SQLAlchemy implementations live in `infrastructure/repositories/`. `presentation/dependencies.py` handles FastAPI dependency injection.

Settings are loaded from `backend/.env` via `infrastructure/config/settings.py` (Pydantic `BaseSettings`). The `.env.example` lists every recognized variable.

### AI / Knowledge Base

`application/ai/knowledge_service.py` (`KnowledgeService`) reads `.md` and `.pdf` files from the `knowledge_base/` directory, optionally compresses them with the `caveman` binary (token-reduction CLI), and passes the consolidated context to **Groq** (`llama-3.3-70b-versatile`) for grounded answers. `analyze_message()` returns a structured JSON response `{reply, correction, suggested_vocabulary}`. Compression results are cached in a class-level dict keyed by `(kb_dir, source_id, mtime, content_len)`. Caveman compression is enabled by `CAVEMAN_ENABLED=true` and `CAVEMAN_BIN` in `.env`.

### Frontend — Feature Modules

```
src/app/           Next.js App Router pages (thin wrappers — logic lives in features/)
src/features/      Domain-driven modules:
  auth/            Login, signup, password reset — hooks, services, domain types
  app/             Shell UI: sidebar, header, settings, auth session hook
  product/         Immersion plan, AI chat, knowledge base, memorization, role play, ranking
  theme/           Dark/light toggle
src/services/http/ Shared HTTP client with automatic JWT refresh (token rotation)
```

The HTTP client (`src/services/http/client.ts`) handles token refresh transparently: on a 401 it attempts `POST /refresh` once, de-duplicates concurrent refresh calls, and retries the original request. API base URL is read from `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:8000`).

Frontend domain types for the immersion plan, knowledge base, and AI chat live in `src/features/product/domain/types.ts`. Access-control rules (e.g. knowledge base admin gate) are in `src/features/product/domain/knowledgeAccess.ts`.

## Key API Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/signup` `/login` `/refresh` | Auth flows |
| GET | `/learning-plan/weekly` | 7-day roadmap with lock/complete state |
| GET | `/learning-plan/day/{day}` | Full day content + section progress |
| POST | `/learning-plan/day/{day}/sections/{key}/complete` | Mark section done (409 if items not all complete) |
| POST | `/ai/chat` | AI chat (Groq + knowledge base) |
| GET/POST/DELETE | `/knowledge` | Knowledge base management |

## Environment Variables

Copy `backend/.env.example` to `backend/.env`. Critical variables:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL DSN (`postgresql+psycopg://...`) |
| `JWT_SECRET_KEY` | Must be changed from default |
| `GROQ_API_KEY` | Required for AI chat and knowledge base Q&A (model: llama-3.3-70b-versatile) |
| `KNOWLEDGE_BASE_DIR` | Directory of `.md`/`.pdf` documents (default: `knowledge_base`) |
| `CAVEMAN_ENABLED` | Toggle caveman compression before AI prompts |

## Database

PostgreSQL via SQLAlchemy 2.0 + psycopg3. Migrations are managed with Alembic (`alembic/versions/`). ORM models are in `infrastructure/database/models/`; they must not be returned directly from repositories — convert to domain entities first.

Start a local Postgres with Docker:
```bash
docker run --name fluencyai-postgres \
  -e POSTGRES_USER=fluencyai -e POSTGRES_PASSWORD=fluencyai -e POSTGRES_DB=fluencyai \
  -p 5432:5432 -d postgres
```

## Troubleshooting

- **Next.js chunk errors**: stop the server, delete `frontend/.next/`, restart `npm run dev`.
- **Known issues**: documented in `docs/troubleshooting-log.md`.
- **Swagger UI**: `http://localhost:8000/docs` — authenticate with `POST /login`, copy `access_token`, click Authorize.
