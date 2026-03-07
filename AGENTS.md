# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

RosterIQ is a serverless monorepo (pnpm workspaces) for healthcare provider roster management. See `README.md` for full architecture and scripts reference.

### Services

| Service | Port | Command |
|---------|------|---------|
| Web app | 3000 | `pnpm run dev` (starts all 3) |
| Provider Portal | 3001 | (started with `pnpm run dev`) |
| Admin Dashboard | 3002 | (started with `pnpm run dev`) |

### Key commands

All standard commands (`build`, `dev`, `test`, `lint`, `clean`) are documented in the root `package.json`. Run from repo root.

### Caveats

- **Node version**: Requires Node.js 20. Use `nvm use 20` before running commands if the default node version differs.
- **Lint**: ESLint is referenced in lint scripts but is not installed as a dependency and has no config files. `next lint` in the Next.js apps will prompt interactively on first run. The `pnpm run lint` command will fail until ESLint is properly configured.
- **Tests**: All test scripts are currently placeholder `echo "No tests"` — they exit 0 but run no actual tests.
- **Prisma**: `pnpm install` triggers a Prisma client postinstall. The `packages/db` package has a Prisma schema; `pnpm run build` generates the Prisma client automatically. No `DATABASE_URL` is needed for build/dev of the frontend apps.
- **Backend services**: The `services/*` TypeScript Lambda services compile with `tsc` during build but are designed to run on AWS Lambda, not locally. Use AWS SAM CLI (`pnpm run sam:local`) for local Lambda testing if needed.
- **Python services** (`services/agents`, `services/graph`): Optional. Only needed if working on AI/ML or graph features. Each has its own `requirements.txt`.
