# DND Damage App Context

## Current objective

Connect the existing app repository to the parent workspace's routing and durable-context system before any new development or optimization begins.

## Current state

- The app is an independent Git repository on branch `main`, tracking `origin/main`.
- The working tree was clean at the start of the project-setup audit on September 24, 2026.
- The project uses React and Vite, with Supabase, ESLint, Tailwind CSS, and standard npm scripts for development, building, linting, and previewing.
- The repository now has local operating instructions, durable context, and a project-specific README.

## Recent decisions

- Keep the app in `dnd-damage-app/`; do not move or reorganize it as part of the workspace setup.
- Keep project instructions and context in the app repository so they travel with the project when it is cloned or published.
- Keep Antonio's personal voice profile outside the app repository.
- Do not begin a code audit or development work until Antonio defines the optimization objective.

## Repository hygiene note

- Vercel has the public Supabase configuration required for deployment.
- The local `.env` is ignored, and `.env.example` documents the required variable names without values.
- The repository no longer uses the real `.env` as its deployment configuration source.
- If the file has ever contained a privileged Supabase service-role key or another secret, remove it from active use and rotate that credential. Removing a file from the latest commit does not remove it from Git history.

## Unresolved questions

- What outcome does "optimize" mean for the next phase: product workflow, usability, accessibility, performance, maintainability, deployment, or another goal?
- Should the repository remain public-facing, private, or unpublished?
- When should the app's legacy `VITE_SUPABASE_ANON_KEY` variable name be migrated to `VITE_SUPABASE_PUBLISHABLE_KEY`?

## Best next actions

1. Confirm the intended optimization outcome and boundaries.
2. Verify the next Vercel deployment and its Supabase-dependent behavior.
3. Review and commit the documentation changes when ready.
