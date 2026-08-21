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

## Keyboard shortcuts

`F1` lists them all. On New Bill: `F2` search/scan, `F3` customer, `F7` bill discount, `F9` save & print, `F10` save only. Everywhere: `N` new bill, `D` dashboard, `B` bills, `R` reports, `P` products, `/` focuses search on list pages.
