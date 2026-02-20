# Commit groups (logical breakdown)

Use this as a reference when splitting work into PRs or when creating a more granular history (e.g. interactive rebase).

## 1. API client & token cookie

- `src/shared/lib/api-client.ts`
- `src/shared/utils/token-cookie.ts`

**Message:** `chore(api): add API client (axios-style) and token cookie helpers`

---

## 2. Auth API

- `src/shared/api/auth/dto.ts`
- `src/shared/api/auth/auth.keys.ts`
- `src/shared/api/auth/auth.api.ts`
- `src/shared/api/auth/index.ts`

**Message:** `feat(api): add auth API (login, register, logout, me)`

---

## 3. User API

- `src/shared/api/user/dto.ts`
- `src/shared/api/user/user.keys.ts`
- `src/shared/api/user/user.api.ts`
- `src/shared/api/user/index.ts`
- `src/shared/api/index.ts`

**Message:** `feat(api): add user API (list, create, import, avatars)`

---

## 4. Auth & user queries

- `src/shared/queries/auth/*`
- `src/shared/queries/user/*`
- `src/shared/queries/index.ts`

**Message:** `feat(queries): add auth and user React Query hooks`

---

## 5. Auth guard & routing

- `src/widgets/AuthGuard.tsx`
- `src/App.tsx` (login/register routes, protected layout, catch-all)

**Message:** `feat(auth): add AuthGuard and public/protected routes`

---

## 6. Login & register pages

- `src/pages/login/page.tsx`
- `src/pages/register/page.tsx`

**Message:** `feat(auth): add Login and Register pages`

---

## 7. Dashboard layout (auth + logout)

- `src/widgets/DashboardLayout.tsx` (AuthGuard, me, logout, nav)

**Message:** `feat(layout): protect dashboard, show user and logout`

---

## 8. Users page

- `src/pages/users/page.tsx` (list, create, import, avatar upload)

**Message:** `feat(users): add Users page (list, create, import, avatars)`

---

## 9. Config & env

- `.env.example`
- `.gitignore` (e.g. `.env`, `.env.local`)

**Message:** `chore: add .env.example and gitignore for env`

---

## Base / scaffold (everything else)

Config, entry, shared UI, hooks, store, dashboard/settings pages, docs, etc. Usually committed first so the app builds before adding API layers.
