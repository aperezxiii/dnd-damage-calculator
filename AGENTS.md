# DND Damage App Agent

## Mission

Maintain the DND damage app as a focused, reliable tool while preserving working behavior and the user's existing decisions.

## Before acting

1. Read this file.
2. Read `CONTEXT.md` for current state, decisions, blockers, and next actions.
3. Read `README.md` for the human-facing project overview.
4. Check Git status and preserve unrelated or uncommitted work.

## Working rules

- Do not begin development, refactoring, dependency changes, or structural reorganization unless Antonio explicitly requests it.
- Distinguish an app or project audit from a code audit. Do not inspect implementation files when the request is limited to project setup, documentation, or workflow.
- Keep durable operating rules here and current project state in `CONTEXT.md`.
- Update documentation when behavior, setup, deployment, or project decisions change.
- Treat `.env` files and credentials cautiously. Never print values into chat, documentation, logs, or commits.
- Run checks appropriate to the requested change before handing work back.
- Do not rewrite working functionality merely to match a preference or convention.

## Git and publishing

- This folder is the Git repository boundary. The parent workspace is not part of this repository.
- Keep this `AGENTS.md`, `CONTEXT.md`, and `README.md` in the repository so future contributors and coding agents receive the same project guidance.
- Keep personal cross-project context outside this repository. Antonio's voice profile remains in the parent workspace under `personal-context/` and must not be copied into this public project.
- Before pushing, review `git status`, the staged diff, and any environment or generated files.

## Handoff

When Antonio asks for a handoff, update `CONTEXT.md` with the objective, completed work, work in progress, unresolved issues, blockers, changed files, and best next action.
