# AgniBooks — Hostinger deployment (saas.risherfoods.com)

Same-origin layout on shared hosting (hPanel). The SPA and the Laravel API share the
domain; `.htaccess` sends `/api/*` to Laravel and everything else to the SPA.

## Server layout

```
~/domains/saas.risherfoods.com/
├── api/        # full Laravel app (with vendor/), OUTSIDE the docroot
└── public_html/          # docroot
    ├── index.html, assets/, sw.js, manifest.webmanifest, ...   # SPA build
    ├── index.php         # Laravel front controller (paths point at ../api)
    └── .htaccess         # /api -> Laravel, SPA fallback, cache headers
```

Because Laravel's routes already carry the `api/` prefix, mounting its front controller
at the docroot makes `https://saas.risherfoods.com/api/login` resolve with zero
rewriting tricks. No CORS is involved (same origin).

## One-time hPanel setup

1. **PHP version** — hPanel → Websites → saas.risherfoods.com → PHP Configuration →
   select **PHP 8.3** (8.2 minimum). Enable extensions if not already on:
   `pdo_mysql`, `mbstring`, `openssl`, `ctype`, `fileinfo` (usually all on by default).
2. **SSH** — hPanel → Advanced → SSH Access → enable, note host/port/user.
3. **Database** — create one for this site. Note DB name, user, password from
   hPanel → Databases (host is `127.0.0.1` on Hostinger shared).
4. **SSL** — hPanel → Security → SSL: make sure the certificate is active.
   (The `.htaccess` also force-redirects to https and strips `www`.)

## Upload

1. Upload `api.zip` to `~/domains/saas.risherfoods.com/` (File Manager or
   `scp`) and extract it there → creates `api/`.
2. Empty `public_html/` (remove Hostinger's default placeholder page), upload
   `public_html.zip` into it and extract. Confirm `.htaccess` is present
   (File Manager hides dotfiles unless "Show hidden files" is on).

## Configure the API

1. Copy `agnibooks-api.env` into the server's `api/.env` and fill in:
   - `DB_DATABASE` / `DB_USERNAME` / `DB_PASSWORD`
   - `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (first Super Admin login)
   The `APP_KEY` is already set — do not regenerate it later or all users are logged out.
2. Over SSH:

   ```bash
   cd ~/domains/saas.risherfoods.com/api
   php artisan migrate --force
   php artisan db:seed --force          # seeds Setting, counters, Super Admin — BEFORE config:cache
   php artisan config:cache
   php artisan route:cache
   chmod -R 775 storage bootstrap/cache
   ```

   Note: `db:seed` must run before `config:cache` because the seeder reads `env()`.

## Cron (scheduler)

hPanel → Advanced → Cron Jobs → add, daily (e.g. 02:00):

```
cd ~/domains/saas.risherfoods.com/api && php artisan schedule:run >> /dev/null 2>&1
```

(Runs `sanctum:prune-expired` and `auth:clear-resets`. Every-minute also works if the
plan allows it; daily is enough for these two jobs.)

## Smoke test

1. `https://saas.risherfoods.com/api/login` in the browser → JSON `405 Method Not Allowed`
   (GET on a POST route) proves Laravel is wired.
2. Open `https://saas.risherfoods.com` → login page loads; log in with the seed admin.
3. Dashboard shows data, no console errors; hard-refresh once so the service worker
   picks up the new origin.
4. Create a test bill and cancel it — verifies the DB write path.
5. On a phone: open the site → "Install app" / "Add to Home screen" (PWA manifest served).
6. Settings → Appearance: switch the theme and save — verifies the new theme columns.

## Redeploying later

- **Frontend**: `npm run build` locally (uses `.env.production`), upload `dist/`
  contents into `public_html/` (don't delete `index.php` / `.htaccess`). The PWA
  auto-updates on next load thanks to the no-cache headers on `sw.js`/`index.html`.
- **Backend**: upload changed files into `api/`, then over SSH:
  `php artisan migrate --force && php artisan config:cache && php artisan route:cache`.

## Gotchas

- `index.php` and `.htaccess` in `public_html/` are the deploy-adjusted copies from
  `deploy/public_html/` in this repo — the SPA build does not produce them.
- Laravel's own `public/` folder inside `api/` is unused on the server
  (harmless to keep).
- If Laravel returns 500 with a blank page, check
  `api/storage/logs/laravel.log` — usually `.env` DB credentials or
  missing `chmod` on `storage/`.
- The old client site (ayyanagenciesdpm.com) keeps its own `sparkbill-api.env` and
  APP_KEY — never reuse this site's key there or vice versa.
