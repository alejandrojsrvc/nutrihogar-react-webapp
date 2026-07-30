---
name: nutrihogar-github-issue
description: Use when implementing or continuing any GitHub issue in alejandrojsrvc/nutrihogar-react-webapp. Loads the repository workflow, frontend architecture, brand rules, validation limits, and pull request requirements from AGENTS.md.
---

# NutriHogar Web Issue Workflow

Use this skill for every GitHub issue implemented in this repository.

## Required Instructions

Read `AGENTS.md` completely before running Git commands, planning, or editing files. Treat it as mandatory repository policy.

The required flow is:

1. Fetch the complete issue using `gh issue view`.
2. Inspect Git state and preserve unrelated changes.
3. Update local `main` with `git pull --ff-only origin main`.
4. Create an issue branch from updated `main`.
5. Read `doc/arquitecture.md`, `doc/FRONTEND_BRAND_GUIDELINES.md`, affected code, tests, and relevant product documents.
6. Present a short plan mapped to acceptance criteria.
7. Implement only the issue scope and explicit dependencies.
8. Add or update tests, states, forms, and documentation required by the issue.
9. Run only lint and tests. Never run build, development servers, preview servers, Docker, deployments, or shared service operations.
10. Review the complete diff, commit only issue files, and push the branch.
11. Open a pull request against `main` with actual validation results and manual desktop/mobile test instructions.
12. Stop after opening the PR. Never merge it or close the issue manually unless the user explicitly overrides this rule.

## Frontend Architecture and Design

Enforce `doc/arquitecture.md` and `doc/FRONTEND_BRAND_GUIDELINES.md`:

- Keep React out of domain and application layers.
- Access generated OpenAPI clients through infrastructure adapters, never directly from components.
- Keep definitive nutrition calculations and authorization in the backend.
- Use TanStack Query for remote state, React Hook Form and Zod for forms, and IndexedDB only behind a repository port.
- Design mobile-first while preserving desktop behavior.
- Include required loading, empty, error, and success states.
- Preserve the warm, simple, precise NutriHogar visual language.
- Do not create speculative abstractions or implement future issues.

## Final Delivery

Return the PR URL, changed areas, lint and test results, commands the user must run for build/runtime verification, numbered mobile and desktop test steps, and any residual risks. State explicitly that build and application startup were not executed.
