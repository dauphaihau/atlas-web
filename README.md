# Atlas Admin Dashboard

Admin dashboard for the Atlas API — **Bun** for package management and scripts.

## Stack

- **Vite + React + TypeScript** — build and UI
- **shadcn/ui** (Base UI) — components and theming
- **Zustand** — global/client state (e.g. `src/store/app-store.ts`)
- **TanStack React Query** — server state and caching (`QueryProvider` in `src/providers/query-provider.tsx`)
- **React Router** — routing and dashboard layout with sidebar

## Setup

```bash
bun install
bun run dev
```

## Scripts

| Command            | Description                |
| ------------------ | -------------------------- |
| `bun run dev`      | Start dev server           |
| `bun run build`    | Production build           |
| `bun run preview`  | Preview production build   |
| `bun run lint`     | Run ESLint                 |

## Project structure

- `src/components/ui/` — shadcn (Base UI) components
- `src/layouts/` — dashboard layout with sidebar
- `src/pages/` — route pages
- `src/providers/` — React Query (and other) providers
- `src/store/` — Zustand stores

See **docs/project-structure.md** for the full FSD layout (features, shared, widgets, domain).

## API reference

The dashboard talks to the **Atlas API** backend. API docs, route list, and error handling are maintained in the backend repo:

- **Repository:** [dauphaihau/atlas-be](https://github.com/dauphaihau/atlas-be)
- **Base path:** `/v1` (e.g. auth, users, import/export, activity logs)
- **Auth:** Laravel Sanctum (token-based); use the backend README for login, register, and token usage.
- **Docs:** The backend uses Scribe for auto-generated API documentation — run the backend locally and check its docs URL for the full reference.

Use the [atlas-be README](https://github.com/dauphaihau/atlas-be) for:

- Quick start and environment setup
- Authentication endpoints (`/v1/register`, `/v1/login`, `/v1/logout`, `/v1/me`)
- Users (CRUD, soft delete, restore, stats)
- CSV import/export and import status
- Activity logs
- Health check
- Error response shape (`message`, `error_code`, `context`)

## Adding shadcn components

The project is configured for **Base UI** (`style: "base-nova"` in `components.json`). Add components with:

```bash
bunx shadcn@latest add <component-name>
```
