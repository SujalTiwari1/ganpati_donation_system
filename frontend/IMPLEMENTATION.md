# Frontend Modules — Implementation Guide

This document describes the seven frontend modules built on top of the existing
infrastructure (API client, services, query hooks, auth, layout shell, dashboard).

## Overview

Every navigation item in `src/components/layout/nav-items.ts` now points to a live
route. All routes live under `src/routes/`, are guarded by the existing `AppShell`
(which redirects unauthenticated users to `/login`), and admin-only pages redirect
non-admins to the dashboard.

### Route map

| Route                | File                              | Access       |
| -------------------- | --------------------------------- | ------------ |
| `/transactions`      | `src/routes/transactions/index.tsx` | All users    |
| `/transactions/new`  | `src/routes/transactions/new.tsx`  | All users    |
| `/transactions/$id`  | `src/routes/transactions/$id.tsx`  | All users    |
| `/buildings`         | `src/routes/buildings/index.tsx`   | All users    |
| `/buildings/$id`     | `src/routes/buildings/$id.tsx`     | All users    |
| `/donors`            | `src/routes/donors/index.tsx`      | All users    |
| `/analytics`         | `src/routes/analytics/index.tsx`  | Admin only   |
| `/audit-logs`        | `src/routes/audit-logs/index.tsx`  | Admin only   |
| `/profile`           | `src/routes/profile/index.tsx`    | All users    |
| `/settings`          | `src/routes/settings/index.tsx`    | All users    |

### Shared conventions

- **Head metadata**: every route defines its own `head()` with a unique title,
  description, and OpenGraph tags.
- **Design tokens**: no new color tokens were introduced — all pages use the
  existing saffron/emerald semantic tokens defined in `src/styles.css`.
- **Reusable components**: all pages reuse the existing `PageHeader`, `StatCard`,
  `StatusBadge`, `SearchInput`, `DataPagination`, `EmptyState`, `ErrorState`,
  and skeleton components from `src/components/common/`.
- **Animations**: Framer Motion is used for list-row stagger and page-level
  entrance transitions, matching the dashboard's existing motion style.
- **Mutations**: TanStack Query mutations with cache invalidation and sonner
  toasts; new hooks live in `src/hooks/queries/`.
- **Admin guards**: admin-only routes check `isAdmin` from the auth provider and
  redirect non-admins to `/dashboard` via `useNavigate`.

---

## 1. Transactions — `/transactions`

### List page (`src/routes/transactions/index.tsx`)

- **Filter bar** with search (donor/mobile/receipt), payment method, status,
  year, and sort controls. All filter state is kept in URL search params so
  filters are shareable.
- **Data table** showing receipt number, donor (name + mobile), building + room,
  amount, method, status, WhatsApp status, date, and a row-actions dropdown.
- **Row actions**: view detail (navigates to `/transactions/$id`), download
  receipt (fetches a PDF blob and triggers a browser download), cancel
  (admin-only, for non-cancelled transactions).
- **Server pagination** via the existing `DataPagination` component.
- **URL params helper**: uses `useUrlSearchParams` (see New utilities below)
  because this TanStack Router version has no `useSearchParams` hook.

### New donation page (`src/routes/transactions/new.tsx`)

- **Form** with donor name, mobile (validated as 10-digit Indian mobile),
  building select (searchable combobox), room number, amount, payment method
  (radio group), notes, and festival year — all validated with zod +
  react-hook-form.
- **Live receipt preview**: a `ReceiptPreviewCard` sits beside the form and
  re-renders as the user types. It shows the temple header, donor block,
  amount in words (Indian numbering system), method, date, and a receipt
  placeholder.
- **Building combobox**: searchable dropdown that lists buildings from the
  API and offers inline creation of a new building by typing a name.
- **Success state**: after a successful create, the page swaps to a success
  card showing the generated receipt number with download, record-next, and
  view-all actions.

### Detail page (`src/routes/transactions/$id.tsx`)

- Full transaction record in a definition list (receipt number, donor, mobile,
  building, room, amount, method, status, WhatsApp status, dates).
- Notes card with duplicate-donation warning if applicable.
- Download receipt and cancel (admin) actions in the header.

### Supporting components

- `src/components/transactions/receipt-preview-card.tsx` — the live preview card.
- `src/components/transactions/building-combobox.tsx` — searchable building picker.
- `src/components/common/whatsapp-status-badge.tsx` — WhatsApp delivery badge.
- `src/utils/amount-to-words.ts` — Indian-system number-to-words converter.

---

## 2. Buildings — `/buildings`

### List page (`src/routes/buildings/index.tsx`)

- **Searchable, sortable, paginated** table of buildings.
- **Create / edit dialog** with name, area, and notes fields (zod-validated).
  The name field shows a live preview of the normalized name.
- **Delete** with an alert-dialog confirmation (soft delete).
- **Restore** action for deleted buildings (appears in the row menu when a
  building has a `deletedAt` timestamp).
- Admin-only actions (create, edit, delete, restore) are hidden for non-admins.

### Detail page (`src/routes/buildings/$id.tsx`)

- Stat cards: total collected, donation count, and status.
- Building details card (name, normalized name, area, notes, created date).
- Recent transactions list filtered to this building.

---

## 3. Donors — `/donors` (simulated)

### Page (`src/routes/donors/index.tsx`)

- **No backend donor endpoint** — donors are derived by fetching transactions
  (up to 200) and grouping client-side by normalized mobile number.
- **Derived per donor**: name (latest used), mobile, building/room, total
  donated, donation count, first/last donation date.
- **Search** by name, mobile, or building.
- **Sort** by total donated, donation count, or most recent.
- **Detail drawer** (Sheet) showing the donor's stats and full donation
  history with receipt numbers, dates, methods, and amounts.
- A visible info banner explains that the data is derived from transactions.

---

## 4. Analytics — `/analytics` (admin)

### Page (`src/routes/analytics/index.tsx`)

- **Stat cards**: year collection, average donation, total transactions,
  highest donation — sourced from the dashboard endpoint.
- **Collection over time** — line chart built from transaction dates.
- **Payment method split** — donut chart from dashboard payment distribution.
- **Top buildings** — horizontal bar chart assembled from transaction aggregates.
- **Top donors** — ranked list with donation count and total.
- **Year switcher** in the header.
- Data is assembled from the dashboard service plus a bulk transaction fetch.
- Non-admins are redirected to `/dashboard`.

---

## 5. Audit Logs — `/audit-logs` (admin)

### Page (`src/routes/audit-logs/index.tsx`)

- **Table** with actor (name + email), entity, action (status badge), label,
  and timestamp.
- **Expandable rows**: clicking a row expands a detail panel showing a
  before/after JSON diff of changed fields, plus the IP address if recorded.
- **Filters**: search (label/user/email), entity, action — all in URL params.
- **Server pagination**.
- Non-admins are redirected to `/dashboard`.

---

## 6. Profile — `/profile`

### Page (`src/routes/profile/index.tsx`)

- **User card** with avatar initials, name, email, and role badge.
- **Account details**: name, email, mobile, role, and joined date.
- **Contribution stats**: donations recorded and total collected, derived
  from the transaction list.

---

## 7. Settings — `/settings`

### Page (`src/routes/settings/index.tsx`)

- **Appearance**: theme picker (light / dark / system) wired to the existing
  `ThemeProvider`.
- **Donation preferences**: default year for new donations, table page size.
- **Receipt preferences**: toggle for showing volunteer name on receipts,
  toggle for WhatsApp preview badges.
- **System info** card (application name, version, backend status).
- **Reset to defaults** button.
- All preferences are persisted to `localStorage` under the
  `vargani.settings` key (defined in `src/constants/index.ts`).

---

## New utilities and hooks

| File                                          | Purpose                                                      |
| --------------------------------------------- | ------------------------------------------------------------ |
| `src/hooks/use-url-search-params.ts`          | URL search-param reader/writer for TanStack Router (replaces the missing `useSearchParams`). |
| `src/utils/amount-to-words.ts`                | Converts a number to English words using the Indian numbering system (lakh/crore), for receipt previews. |
| `src/components/common/whatsapp-status-badge.tsx` | Badge showing WhatsApp delivery status with an icon and color tone. |
| `src/components/transactions/receipt-preview-card.tsx` | Live receipt preview card used in the new-donation form. |
| `src/components/transactions/building-combobox.tsx` | Searchable building selector with inline create option. |

## Modified files

| File                          | Change                                                      |
| ----------------------------- | ---------------------------------------------------------- |
| `src/types/api.ts`            | Added optional `isDuplicate` and `duplicateOverrideReason` fields to the `Transaction` type. |
| `src/routeTree.gen.ts`         | Manually regenerated to include all 13 routes. The TanStack Router Vite plugin will regenerate this automatically when the dev server runs. |

## Type system notes

- The `Transaction` type's `building` and `roomNumber` fields are nullable in
  the API contract, so donor/building derivation code uses null-coalescing
  fallbacks (`?? ""`, `?? null`).
- The `WhatsappStatus` type includes `PENDING`, `SENT`, `DELIVERED`, `READ`, and
  `FAILED` — the badge component handles all five.

## Build verification

- `npx tsc --noEmit` passes with no errors.
- `npm run build` completes successfully, producing the server and client bundles.
