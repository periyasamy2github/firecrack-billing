# SparkBill — Fireworks Shop Billing

Counter billing for a fireworks shop: GST tax invoices and bills of supply, thermal 80mm and A4 printing, a product catalogue with Excel import, and sales reports. Every counter has its own products and bills; staff are locked to one counter, a Super Admin sees everything.

- `src/` — React SPA (React 19 · TypeScript · Vite · MUI 6 · Redux Toolkit · react-hook-form + Zod · axios)
- `backend/` — Laravel 12 API (MySQL · Sanctum bearer tokens) — see [backend/README.md](backend/README.md)

## Running locally

**1. API**

```bash
cd backend
composer install
cp .env.example .env     # set DB_*, CORS_ALLOWED_ORIGINS, SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD
php artisan key:generate
php artisan migrate
php artisan db:seed      # shop row + your Super Admin
php artisan serve        # http://localhost:8000
```

**2. SPA**

```bash
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:8000/api
npm run dev              # http://localhost:5173/firecrack-billing/
```

Sign in with the `SEED_ADMIN_*` credentials, then create counters, staff and products from the Master menu (or import products from Excel — the dialog offers a template).

## Demo data (dev only)

```bash
cd backend && php artisan db:seed --class=DemoSeeder
```

Creates counters Erode / Chennai / Kovai, six sample products per counter, and these logins (password `123456`):

| Email | Role | Counter |
|---|---|---|
| `admin@gmail.com` | Super Admin | all |
| `user@gmail.com` | Counter Staff | Erode |
| `user1@gmail.com` | Counter Staff | Chennai |
| `user2@gmail.com` | Counter Staff | Kovai |
| `inactive@gmail.com` | Counter Staff (deactivated) | Erode |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` / `npm run build` / `npm run preview` | Vite dev server / `tsc -b` + production build to `dist/` / serve the build |
| `npm run lint` | oxlint |
| `node scripts/make-import-test-sheet.mjs`, `node scripts/make-bulk-test-sheet.mjs` | Sample spreadsheets for testing Products → Import (written to `test-data/`, git-ignored) |

## Deploying

- **SPA**: `vite.config.ts` sets `base: '/firecrack-billing/'` for GitHub Pages — change it if the app is served from a domain root. Build with `VITE_API_URL=https://<api-domain>/api npm run build` and upload `dist/`.
- **API**: follow the production checklist in [backend/README.md](backend/README.md) (`APP_DEBUG=false`, CORS origin, seed before `config:cache`, cron for `schedule:run`).

## Architecture

```
Browser (React SPA, /firecrack-billing/) ──axios, Bearer token──▶ Laravel 12 API (/api/*) ──Eloquent──▶ MySQL
```

One shop, many **counters**. Every product and bill belongs to exactly one counter. **Counter Staff** are locked to their counter server-side; a **Super Admin** sees everything and picks a counter (or *All counters*) from the sidebar. Prices are GST-inclusive: the rate is the final price, tax is extracted from it and split CGST/SGST.

### Frontend — `src/`

| Folder | What lives there |
|---|---|
| `services/api.ts` | The only place that talks to the server: axios instance, `getToken`/`setToken` (localStorage `token`), two interceptors (attach Bearer; 401 → clear token + go to `/login`; other errors → global toast), and `api.*` — one method per endpoint. |
| `redux/` | RTK slices with thunks (no RTK Query): `session` (user, load status, `counterScope`), `shop`, `counters`, `users`, `products`, `ui`. `store.ts` resets everything on `signOut`. |
| `hooks/` | `useSession` (user, counters, `counterScope`, `selectedCounter`, `billingCounter`, `signOut`), `useBillsPage` (server-paginated bills), `useListPage` (client-side search/filter/page for small lists), `usePendingAction` (per-row in-flight guard), `useKeyShortcuts`, `useToast`. |
| `pages/<Page>/` | One folder per screen. The container (`Bills.tsx`) owns state, hooks and handlers; sibling components (`BillsTable.tsx`) only render. |
| `components/` | Shared primitives — `PageHeader`, `TableCard`, `StatusPill`, `ListFooter`, `SearchField`, `RouteGuards`, … |
| `css/{components,layouts,pages}/` | All CSS modules, named after the file they style. |
| `types/index.ts` | Domain types (`Bill`, `Product`, `Counter`, `User`, `Shop`) and the API shapes (`BillsPage`, `DashboardStats`, …). |
| `utils/` | `billing.ts` (totals and GST maths — same formulas as the server), `format.ts`, `routes.ts`, `billFilters.ts`, `csv.ts`. |

**Boot and auth.** `RequireAuth` checks the token, dispatches `loadSession` (`GET /me` → user, shop, counters; each slice takes its part) and shows a loader until the session is `ready`. `Login` posts credentials, stores the token, runs the same `loadSession`, and sets `counterScope` (staff: their counter, admin: `all`). Sign-out revokes the token (`POST /logout`), clears it, and wipes the store.

**Counter scope.** `counterScope` (`all` or a counter id) is the only UI state persisted (localStorage `sparkbill:counter-scope`). Data pages send it as `?scope=`; the server ignores it for staff.

**Screens.** *New Bill* preloads the counter's products once and searches them in memory (30-row cap, Enter on an exact barcode adds instantly); F9 saves & prints, F10 saves only. *Bills* / *Reports* are server-paginated with search, filters, date range, cancel (restores stock), reprint and CSV export. *Print* renders a thermal 80 mm receipt or an A4 tax invoice (GST bills only) at `/bills/:encryptedId/print`. *Products → Import* validates rows client-side (Zod) and lets the server decide create-vs-update. *Users*, *Counters*, *Settings* are Super Admin only (route guard + server role middleware). Forms are react-hook-form + Zod; confirmations use `material-ui-confirm`.

### Backend — `backend/`

| Piece | Role |
|---|---|
| `routes/api.php` | `POST /login` (throttled); everything else under `auth:sanctum` + `active`; writes to shop/counters/users/products under `role:Super Admin`. |
| `Http/Controllers/Api/*` | Thin controllers: validate with `$request->validate` + `Rule::*`, scope, call Eloquent or `BillService`, return a Resource. |
| `Http/Resources/*` | The wire contract (snake_case DB → camelCase JSON). `BillResource` emits `id` as `encrypt($id)`; the bills list is Laravel's paginator plus `counts`/`totals` via `->additional()`. |
| `Services/BillService.php` | Creating a bill in one transaction (lock the invoice counter, deduct stock with row locks, compute GST totals, insert bill + items), cancelling (restore stock), reprint, and the touched-products echo. |
| `Models/*` | `Bill` (`visibleTo($user)` scope), `BillItem`, `Product` (soft deletes, unique per counter + barcode), `BillCounter`, `User` (hashed password), `Setting` (singleton row). |
| `Http/Middleware/` | `EnsureActive` (deactivated mid-session → token revoked, 401) and `RoleMiddleware`. |
| `database/` | Nine create-migrations. `DatabaseSeeder` = shop row + Super Admin from `SEED_ADMIN_*`; `DemoSeeder` = sample counters, logins and products for development. |
| `config/` | CORS from `CORS_ALLOWED_ORIGINS`; Sanctum tokens expire after 8 h; `routes/console.php` schedules token and password-reset pruning. |

Authorization is enforced in the controllers: `Bill::visibleTo($user)` for lists and `authorizeCounter()` for anything that names a counter — staff requests are forced to their own counter whatever they send. The server owns the billing invariants: invoice numbers are assigned under a row lock, stock can never go negative (409), closed counters cannot bill (422), only paid bills can be cancelled, and totals are recomputed from product rates at bill time and frozen into `bill_items`.

### A sale, end to end

1. The cashier scans; `ProductSearchField` finds the product in memory and adds a line; totals recalculate locally.
2. F9 → `POST /api/bills` with `{ counterId, items[{ code, qty }], discount, gstApplicable, … }`.
3. `BillService::create` runs in one transaction: next invoice number, stock − qty per line, totals, insert.
4. The response `{ bill, products[{ code, counterId, stock }] }` updates the store's stock and the next invoice number.
5. The SPA opens `/bills/<encrypted id>/print` with the bill in navigation state; a refresh re-fetches it via `GET /bills/find?id=` (decrypted server-side; a tampered id is a 404).

## Keyboard shortcuts

`F1` lists them all. On New Bill: `F2` search/scan, `F3` customer, `F7` bill discount, `F9` save & print, `F10` save only. Everywhere: `N` new bill, `D` dashboard, `B` bills, `R` reports, `P` products, `/` focuses search on list pages.
