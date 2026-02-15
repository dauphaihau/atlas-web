# New Project Structure

This document outlines the modernized folder structure for the SVG Editor application, following Feature-Sliced Design principles and inspired by clean architecture patterns.

## Overview

The project is organized into the following main directories within `src/`:

```
src/
├── features/          # Feature modules (business features)
├── pages/             # Page-level components
├── shared/            # Shared utilities and infrastructure
├── widgets/           # Reusable widget components
└── domain/            # Domain entities and business logic
```

---

## 📁 features/

Feature modules containing self-contained business features. Each feature encapsulates its own components, hooks, stores, and business logic.

### Structure

```
features/
├── asset-editor/              # Asset editing functionality
├── game-preview/              # Game preview and runtime
│   ├── components/
│   │   └── NativeScenes/      # Native scene implementations
│   │       ├── AuthenticateScene/
│   │       ├── ClaimScene.tsx
│   │       ├── CommonComponents/
│   │       ├── CountToStartDateScene/
│   │       ├── HiddenRewardScene.tsx
│   │       ├── HomeScene/
│   │       ├── LeaderboardScene/
│   │       ├── ...
│   ├── constants.ts
│   ├── game-preview.store.ts
│   ├── GamePreview.tsx
│   └── hooks/
├── game-settings/             # Game configuration and settings
├── text-to-game/              # AI text-to-game generation
└── user-flow/                 # User flow visualization and management
    ├── components/
    │   ├── ChangeFlowButton/
    │   │   ├── ChangeFlowButton/
    │   │   │   ├── AuthMethods.tsx
    │   │   │   └── MainFeatures/
    │   │   └── UserFlowPreview/
    │   └── Flow/
    │       ├── components/
    │       │   ├── BeforeGameSection.tsx
    │       │   ├── ClaimRewardSection.tsx
    │       │   ├── FlowDash.tsx
    │       │   └── shared/
    │       └── Flow.tsx
    ├── constants/
    ├── hooks/
    ├── user-flow.constants.ts
    ├── user-flow.store.ts
    └── UserFlow.tsx
```

### Organization Pattern

Each feature follows this internal structure:
- `components/` - Feature-specific React components
- `hooks/` - Feature-specific custom hooks
- `constants/` or `*.constants.ts` - Feature constants
- `*.store.ts` - Client state management (Zustand for drafts/UI state)
- `*.tsx` - Main feature component

Server state is managed via React Query in `shared/queries/`.

### Key Features

- **asset-editor**: Tools for editing and manipulating assets
- **game-preview**: Runtime preview of game scenes with native implementations
- **game-settings**: Comprehensive game configuration interface
- **text-to-game**: AI-powered game generation from text descriptions
- **user-flow**: Visual flow builder for user journey management

---

## 📁 pages/

Page-level components that represent entire routes/views in the application.

### Structure

```
pages/
└── ui-settings.page.tsx       # UI settings configuration page
```

### Characteristics

- Each file represents a distinct route/page
- Pages compose features and widgets
- Minimal business logic (delegated to features)
- Route-level data fetching and layout

---

## 📁 shared/

Shared infrastructure, utilities, and cross-feature dependencies following the FSD (Feature-Sliced Design) shared layer pattern.

### Structure

```
shared/
├── api/                       # API layer
│   ├── game/
│   │   ├── dto/
│   │   │   ├── game-settings-base.dto.ts
│   │   │   └── update-game-settings.dto.ts
│   │   ├── game.api.ts
│   │   ├── game.dto.ts
│   │   ├── game.keys.ts
│   │   └── index.ts
│   └── project/
│       ├── dto/
│       │   ├── project-base.dto.ts
│       │   └── project-detail.dto.ts
│       ├── index.ts
│       ├── project.api.ts
│       └── project.keys.ts
├── hooks/                     # Shared React hooks
│   ├── useCurrentGameSetting.tsx
│   ├── useCurrentProject.tsx
├── lib/                       # Shared libraries and utilities
│   ├── logger.ts
│   ├── merge-tw-classes.ts
│   └── query-client.ts
├── ui/                        # Shared UI components (shadcn/ui)
│   ├── icons/                 # Custom SVG icon components
│   │   ├── game-icons.tsx     # Game-related icons (LeaderboardIcon, etc.)
│   │   ├── reward-icons.tsx   # Reward-related icons (HeartLessFaceIcon, etc.)
│   │   └── index.ts
│   ├── combobox.tsx
│   ├── command.tsx
│   ├── popover.tsx
│   ├── select.tsx
│   └── index.ts
├── queries/                   # React Query queries/mutations
│   ├── game/
│   │   ├── get-game-settings.query.ts
│   │   ├── update-game-settings.mutation.ts
│   │   └── update-logo.mutation.ts
│   └── project/
│       └── get-project.query.ts
└── utils/                     # Shared utility functions
    └── get-token-cookie-name.ts
```

### Organization Pattern

- **api/** - API clients, DTOs, and query keys organized by domain
  - DTOs for request/response type safety
  - Query keys for React Query cache management
  - API clients for HTTP communication
- **hooks/** - Cross-feature React hooks
- **lib/** - Third-party integrations and configurations
  - `query-client.ts` - React Query configuration
  - `logger.ts` - Application logger
  - `merge-tw-classes.ts` - Tailwind class merging utility (`mc`)
- **ui/** - Shared UI components based on shadcn/ui
  - **icons/** - Custom SVG icon components organized by category
    - Icons used across 2+ features
    - Grouped by domain (game-icons, reward-icons, etc.)
    - Consistent API with `fill`, `stroke`, and standard SVG props
  - Primitive components (Select, Combobox, Popover, Command)
  - Styled with project's dark theme
  - Built on Radix UI primitives
- **queries/** - React Query queries and mutations (server state source of truth)
  - Handles all server-side data fetching and mutations
  - Organized by domain (game/, project/)
- **utils/** - Pure utility functions

### Usage Guidelines

- Only shared code that's used by 2+ features belongs here
- No feature-specific logic
- Maintains clear domain boundaries (game/, project/, etc.)
- DTOs ensure type safety across API boundaries

#### Icon Usage Example

```typescript
// Import icons from shared UI
import { HeartLessFaceIcon, LeaderboardIcon } from '@/shared/ui';

// Use with custom props
<LeaderboardIcon fill="#ff0000" width={24} height={24} className="my-icon" />
<HeartLessFaceIcon fill="#00ff00" stroke="#000" />
```

**Adding New Icons:**
1. Determine the category (game, reward, navigation, etc.)
2. Add to existing category file or create new one in `shared/ui/icons/`
3. Export from `shared/ui/icons/index.ts`
4. Icons are automatically available via `@/shared/ui`

---

## 📁 widgets/

Reusable widget components that can be used across multiple features and pages.

### Structure

```
widgets/
├── Gizmo.tsx                  # Gizmo widget component
└── Panel.tsx                  # Panel widget component
```

### Characteristics

- Highly reusable UI components
- Self-contained with minimal external dependencies
- Can be composed into larger features
- Typically stateless or manage only internal state
- Focus on presentation and interaction patterns

### Usage

Widgets are building blocks that bridge the gap between low-level UI components and feature-specific components.

---

## 📁 domain/

Domain layer containing business validation logic and domain-specific utilities.

### Structure

```
domain/
└── game-setting/              # Game settings validation logic
    └── validators.ts
```

### Pattern (game-setting/)

The `game-setting/` folder demonstrates the new domain layer approach:

- **validators.ts** - Domain validation logic
  - Business rule validation
  - Type-safe validation functions
  - Decoupled from UI and API layers
  - Reusable across features

### Usage in New Architecture

In the modernized structure, domain logic should follow this pattern:

```
feature/
├── components/              # UI components
├── hooks/                   # Feature hooks
├── *.store.ts              # Client state (Zustand)
└── domain/                 # Optional: feature-specific domain logic
    └── validators.ts       # Validation rules

shared/
├── api/                    # API contracts and DTOs
├── queries/                # Server state (React Query)
└── utils/                  # Shared utilities

domain/
└── [feature-name]/         # Domain validation and business rules
    └── validators.ts
```

---

## Architectural Principles

### 1. Feature-Sliced Design (FSD)

- Features are independent and self-contained
- Shared code lives in `shared/`
- Clear boundaries between layers
- Pragmatic adoption without strict enforcement

### 2. Clean Architecture Inspired

- Domain layer is independent of frameworks
- Business logic is isolated in domain entities/services
- Infrastructure details are abstracted via repositories
- Note: The project is inspired by Clean Architecture principles but not strictly adherent to all its rules

### 3. Separation of Concerns

- **features/**: Business feature implementation
- **pages/**: Routing and page composition
- **shared/**: Cross-cutting concerns
- **widgets/**: Reusable UI components
- **domain/**: Business rules and entities

### 4. Dependency Direction

```
pages → features → widgets → shared
  ↓
domain (independent)
```

- Pages depend on features
- Features depend on widgets and shared
- Domain is independent (no outward dependencies)
- All layers can depend on shared utilities

### 5. State Management Strategy

The project uses a dual-state management approach:

#### Server State (Source of Truth) - React Query

- **Purpose**: Manages server-side data and synchronization
- **Location**: `shared/queries/`
- **Responsibility**:
  - API data fetching and caching
  - Server state synchronization
  - Request deduplication
  - Background refetching
  - Optimistic updates
- **Examples**:
  - `get-game-settings.query.ts`
  - `update-game-settings.mutation.ts`
  - `get-project.query.ts`

#### Client State (Draft/Local) - Zustand

- **Purpose**: Manages client-side application state and UI state
- **Location**: Feature-level `*.store.ts` files
- **Responsibility**:
  - Local UI state
  - Draft changes before server sync
  - User interactions
  - Feature-specific state
- **Examples**:
  - `game-preview.store.ts`
  - `user-flow.store.ts`

#### Pattern

```
User Action → Zustand (draft) → React Query Mutation → Server → React Query Cache (source of truth)
                ↓
              UI Update (optimistic)
```

This separation ensures:
- Clear distinction between local drafts and persisted data
- Predictable data flow
- Easier debugging and testing
- Reduced race conditions

---

## Migration Notes

This structure represents a modernized architecture moving towards:

1. **Feature isolation**: Each feature is a self-contained module
2. **Domain-driven design**: Business logic centralized in domain layer
3. **Shared infrastructure**: Common code deduplicated in shared layer
4. **Type safety**: DTOs and validators ensure compile-time safety
5. **Scalability**: Clear boundaries enable parallel development
6. **Clear state management**: React Query for server state, Zustand for client state
