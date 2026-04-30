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

## 🔎 Swagger and Manual API Testing

FastAPI exposes Swagger automatically:

```text
http://localhost:8000/docs
```

The raw OpenAPI document is available at:

```text
http://localhost:8000/openapi.json
```

### Authenticated Requests in Swagger

1. Open `http://localhost:8000/docs`.
2. Run `POST /signup` or `POST /login`.
3. Copy the `access_token` from the response.
4. Click **Authorize** in Swagger.
5. Paste only the token value when Swagger asks for the bearer token.
6. Test protected endpoints normally.

Example login payload:

```json
{
  "email": "ana@example.com",
  "password": "strong-password"
}
```

### Immersion Plan API Test Flow

Use this order to validate the current Onda 2 implementation:

1. `GET /learning-plan/weekly`
   - Confirms the weekly roadmap, current day, locked days, completed days, and focus lesson.
2. `GET /learning-plan/day/1`
   - Loads the full content for Day 1 with section progress.
3. For each section (`phrases`, `vocabulary`, `grammar`, `grammar_practice`, `speaking`, `quiz`), complete all items in that section first using the item keys returned by `GET /learning-plan/day/1`.
   - Required precondition: `POST /learning-plan/day/1/sections/{section_key}/complete` returns `409 Conflict` until every item in that section is completed.
4. `POST /learning-plan/day/1/sections/phrases/complete`
5. `POST /learning-plan/day/1/sections/vocabulary/complete`
6. `POST /learning-plan/day/1/sections/grammar/complete`
7. `POST /learning-plan/day/1/sections/grammar_practice/complete`
8. `POST /learning-plan/day/1/sections/speaking/complete`
9. `POST /learning-plan/day/1/sections/quiz/complete`

After each section completion, `progress_percent` should increase by roughly 17 points because the Immersion Plan has six sections. When all six sections are complete, the day reaches 100%.

Useful database checks:

```sql
SELECT *
FROM lesson_section_progress
ORDER BY completed_at DESC;
```

```sql
SELECT *
FROM user_progress;
```

---

## 🧭 Application Tour

Start the frontend at:

```text
http://localhost:3000
```

Recommended validation path:

1. **Signup/Login**
   - Use `/signup` to create a user or `/login` to enter with an existing account.
   - After authentication, the app redirects to the authenticated area.

2. **Dashboard**
   - Route: `/app`
   - Main landing screen for the logged-in user.

3. **Immersion Plan**
   - Route: `/app/plan`
   - Shows the Weekly Roadmap, current lesson, daily progress, and six learning sections:
     - Essential Phrases
     - Thematic Vocabulary
     - Grammar Points
     - Verb & Structure Practice
     - Speaking Exercise
     - Final Quiz
   - Click a card action such as **Review list**, **Resume Study**, **Begin Practice**, or **Take Final Exam**.
   - The modal shows the real lesson content.
   - Click **Mark Complete** to persist section progress.
   - The progress bar updates across the six learning sections.

4. **Knowledge Base**
   - Route: `/app/knowledge`
   - Visible only to authorized admin users; any additional email-based restriction should be configured server-side.
   - Supports `.md` and `.pdf` document upload, content viewing, and deletion.
   - This is the Onda 3 foundation for grounded AI answers.

5. **AI Chat**
   - Route: `/app/chat`
   - Conversational practice with correction and vocabulary suggestions.
   - When Gemini is configured, the backend can consult the Knowledge Base.
   - Knowledge Base context is caveman-compressed before the AI prompt when `CAVEMAN_ENABLED=true` and the `caveman` binary is available.

6. **Memorization**
   - Route: `/app/memorization`
   - Vocabulary practice flow using learning words and memory tips.

7. **Role Play**
   - Route: `/app/role-play`
   - Scenario-based conversation practice.

8. **Ranking and Settings**
   - Routes: `/app/ranking` and `/app/settings`
   - Ranking displays gamification context.
   - Settings handles account preferences such as password and avatar updates.

---

## 🧯 Troubleshooting

If Next.js shows an old chunk error such as `Cannot find module './755.js'`, stop the frontend, remove the stale `frontend/.next` directory, and start `npm run dev` again.

Known local issues and their fixes are documented in:

```text
docs/troubleshooting-log.md
```

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
