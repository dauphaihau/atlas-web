# Admin Dashboard

This project uses **Bun** for package management and running scripts.

Vite + React + TypeScript admin dashboard with:

- **shadcn/ui** (Base UI) – components and theming
- **Zustand** – global state (e.g. `src/store/app-store.ts`)
- **TanStack React Query** – server state and caching (`QueryProvider` in `src/providers/query-provider.tsx`)
- **React Router** – routing and dashboard layout with sidebar

## Setup

```bash
bun install
bun run dev
```

## Scripts

- `bun run dev` – start dev server
- `bun run build` – production build
- `bun run preview` – preview production build
- `bun run lint` – run ESLint

## Structure

- `src/components/ui/` – shadcn components (Base UI)
- `src/layouts/` – dashboard layout with sidebar
- `src/pages/` – route pages
- `src/providers/` – React Query (and other) providers
- `src/store/` – Zustand stores

## Adding shadcn components

Project is configured for **Base UI** (`style: "base-nova"` in `components.json`). Add components with:

```bash
bunx shadcn@latest add <component-name>
```
