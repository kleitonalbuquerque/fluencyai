# FluencyAI

SaaS web app for language learning inspired by Duolingo, built with FastAPI, PostgreSQL, Next.js, and JWT auth.

---

## 🎯 Project Objective
Build a complete language learning platform featuring:
- Structured learning paths
- AI-powered conversations
- Gamification (XP, ranking, streaks)
- Scalable Clean Architecture
- Clean, testable code following TDD

---

## 🧠 Core Specification (Mandates)

### Development Rules
- **TDD is Mandatory:** Create tests before implementation for every feature.
- **Clean Architecture:** Strictly follow layers: `domain` / `application` / `infrastructure` / `presentation`.
- **Decoupling:** Do NOT couple UI with business logic. No direct API calls in components.
- **SOLID Principles:** Apply to all backend and frontend logic.
- **Modularization:** Organize code by feature.
- **Fixed Versions:** Use exact versions for dependencies (no `^`).

### Stack
- **Frontend:** Next.js 15.3.0 (App Router), React 19.2.5, TypeScript, Tailwind CSS.
- **Backend:** Python, FastAPI, SQLAlchemy, Alembic.
- **Testing:** Vitest + Testing Library (Frontend), Pytest (Backend).
- **Database:** PostgreSQL.
- **Auth:** JWT (Access/Refresh) + Google OAuth.

---

## 🧱 Project Structure

```text
/backend
  /domain          # Entities and business rules
  /application     # Use cases and services
  /infrastructure  # Database, repositories, external services
  /presentation    # API routes, schemas, and dependencies
  /tests           # Pytest suite

/frontend
  /src
    /app           # Next.js pages and layouts
    /features      # Domain-specific components, hooks, and logic
    /services      # API clients and sessions
    /hooks         # Shared hooks
    /tests         # Setup and global tests
```

---

## 🗄️ Entities
- **User:** id, email, password_hash, xp, level, streak.
- **Learning:** Lesson, VocabularyWord, Phrase, GrammarPoint.
- **Progress:** UserProgress, UserWord.
- **System:** Ranking, Subscription, OAuthAccount, PasswordResetToken.

---

## 📚 Product Features

- **Plano de Imersão (7 dias):** 20 frases, 15 palavras, 5 pontos gramaticais, fala e quiz.
- **Conversa com IA:** Simulação de nativo, correção amigável ("Isso soa bem! Só uma coisinha pequena..."), sugestão de vocabulário.
- **Sistema de Memorização:** 20 palavras/sessão, frases reais, truques de memória, teste 100%.
- **Role Play:** Entrevista, café, viagem com correção em tempo real.
- **Gamificação:** XP, streak diário, ranking global, níveis.
- **Social:** Compartilhamento de progresso e ranking.

---

## ⚙️ Requirements

### Functional (RF)
- RF01-RF02: Account Creation & Login
- RF03: Daily Plan Generation
- RF04-RF05: AI Chat & Phrase Correction
- RF06: Progress Saving
- RF07-RF08: Global Ranking & Daily Streak
- RF09-RF10: Quiz & Social Sharing

### Non-Functional (RNF)
- Performance: < 1s response time (excluding AI).
- Test Coverage: Minimum 80%.
- Security: Password hashing + JWT.

---

## 🛠️ Local Development

### Prerequisites
- Docker (for PostgreSQL)
- Python 3.10+
- Node.js 20+

### Backend Setup
1. `cd backend`
2. `python -m venv .venv`
3. `source .venv/bin/activate`
4. `pip install -r requirements.txt`
5. Start PostgreSQL: `docker run --name fluencyai-postgres -e POSTGRES_USER=fluencyai -e POSTGRES_PASSWORD=fluencyai -e POSTGRES_DB=fluencyai -p 5432:5432 -d postgres`
6. `alembic upgrade head`
7. `uvicorn presentation.api.main:app --reload`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

---

## ✅ Quality Checks

```bash
# Backend Tests
cd backend && pytest

# Frontend Tests
cd frontend && npm test

# Build Check
cd frontend && npm run build
```
