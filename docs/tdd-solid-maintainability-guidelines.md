# TDD, SOLID, and Maintainability Guidelines

This document is the engineering checklist for every new FluencyAI implementation.
Use it before coding, during review, and before opening a PR.

## Non-Negotiable Rules

- Write or update tests before changing production behavior.
- Keep business rules out of UI components and API route handlers.
- Preserve Clean Architecture boundaries: `domain`, `application`, `infrastructure`, `presentation`.
- Prefer small cohesive modules over large procedural files.
- Do not introduce duplicate logic when an existing service, repository, hook, or helper owns the behavior.
- Keep changes scoped to the feature or bug being implemented.
- Do not hide complexity in generic abstractions unless they reduce real duplication or clarify ownership.

## TDD Flow

1. Describe the expected behavior in a focused test.
2. Run the test and confirm it fails for the right reason.
3. Implement the smallest production change that passes the test.
4. Refactor only after the test passes.
5. Run the affected test suite and at least one integration path for user-facing behavior.

Good tests should verify behavior, not implementation details. Prefer testing public APIs, use cases, hooks, and visible UI outcomes. Mock external services at boundaries, not inside the domain logic.

## Backend Guidelines

- `domain`: pure entities, value objects, constants, and business invariants. No database, HTTP, framework, or AI SDK dependencies.
- `application`: use cases and orchestration. It may depend on repository/service protocols, not concrete infrastructure classes.
- `infrastructure`: SQLAlchemy models, repositories, external clients, compression, AI providers, token implementations.
- `presentation`: FastAPI routes, request/response schemas, dependency wiring, HTTP error mapping.
- Repositories should return domain entities or simple domain DTOs, not ORM models.
- Avoid N+1 queries; prefer explicit joins or eager/selectin loading when hydrating aggregate data.
- Keep transactions explicit. Do not commit from unrelated helper functions.
- Treat migrations and seed data as production assets: deterministic, repeatable, and safe to run more than once.

## Frontend Guidelines

- Components render state and dispatch user intent; they should not contain API orchestration or business rules.
- Put API calls in `features/*/services` or shared service clients.
- Put reusable feature state in hooks, keeping network concerns and session updates out of presentational components.
- Keep domain types in `features/*/domain`.
- Use Tailwind design tokens from the theme instead of hard-coded palette classes when the color represents app semantics.
- Keep modals, cards, and controls accessible: labels, button types, visible focus states, and clear disabled states.
- For async UI, always handle loading, success, empty, and error states.

## SOLID Applied Pragmatically

- Single Responsibility: each class, hook, service, component, or function should have one reason to change.
- Open/Closed: extend behavior through small strategies, protocols, or data maps when variation is expected.
- Liskov Substitution: implementations of repositories/services must honor the same contracts and error expectations.
- Interface Segregation: keep protocols focused; do not force consumers to depend on methods they do not use.
- Dependency Inversion: application services depend on abstractions; infrastructure provides concrete implementations.

Do not force SOLID terminology into every design. Use the principles to avoid brittle coupling, sprawling files, and hidden side effects.

## Anti-Patterns To Avoid

- Components directly calling `fetch`.
- Route handlers containing business decisions that belong in application services.
- Service methods that both validate business rules and know SQL details.
- Shared mutable state without a clear owner.
- Large functions with multiple unrelated responsibilities.
- Silent exception swallowing without a fallback, log, or user-visible error.
- Generic names such as `manager`, `helper`, `utils`, or `data` when a specific domain name exists.
- Copying a block of logic into another file instead of extracting an explicit function or service.
- Adding new dependencies before checking existing project patterns.

## PR Readiness Checklist

- Tests were added or updated before implementation.
- A failing test would catch the main regression.
- Affected backend tests pass with `pytest`.
- Affected frontend tests pass with `npm test`.
- TypeScript passes when frontend types are touched.
- Migrations are reversible and seed data is deterministic.
- Public API responses remain stable or are documented.
- User-facing copy and UI states are clear.
- No unrelated refactors, formatting churn, or generated artifacts are included.

## When In Doubt

- Prefer explicit, local, readable code over clever abstractions.
- Prefer a small duplicated line over a premature abstraction, but do not duplicate business rules.
- Ask whether the next developer can find the owner of the behavior in under one minute.
- If the answer is no, improve naming, module placement, or documentation before merging.
