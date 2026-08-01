---
name: nutrihogar-github-issue
description: Use when implementing or continuing one or more GitHub issues in alejandrojsrvc/nutrihogar-react-webapp. Applies the repository-only workflow, targeted validation, per-issue commits, and PR closure rules.
---

# NutriHogar Web Issues

Work only in this repository and follow `AGENTS.md`; do not inspect or modify the API repository.

## Workflow

1. Fetch every requested issue as readable Markdown with `gh issue view <number> --repo alejandrojsrvc/nutrihogar-react-webapp` and confirm it is open. Do not request JSON or create temporary files.
2. Inspect Git once and preserve unrelated changes.
3. Run `git fetch origin main`, then create one branch for the whole request directly from `origin/main`. Do not switch to or pull local `main`.
4. Search code locally with Glob and Grep, then read affected code and tests. Never use `gh api search/code`; inspect history only for explicit regressions or referenced commits. Read architecture, brand guidelines, sprint, or PDR only when required.
5. Present at most five plan points and implement only the requested scope.
6. Create or update meaningful Vitest tests for acceptance criteria, observable user behavior, validation, states, errors, and accessibility. Never add trivial tests or weaken existing coverage.
7. After all changes, run lint once. Do not run frontend tests or build locally; GitHub Actions owns both checks.
8. Create one conventional commit for the whole request, then push once.
9. Open one PR against `main` with a section per issue, local lint result, tests and build marked as pending in GitHub, and `Closes #N` for every fully completed issue.
10. Return the PR URL without waiting for CI. Never merge or close issues manually.

Do not invent commands. Only use scripts confirmed in `package.json`. Never run build, development servers, preview, Docker, deployments, shared services, destructive Git commands, or force push.
