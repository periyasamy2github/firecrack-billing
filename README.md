# SparkBill API

Laravel 12 + MySQL API for SparkBill, the fireworks-shop counter-billing app. The React SPA that calls it lives on the `main` branch of the same repository; this branch holds only the API. JSON only — no Blade pages, no Vite. Auth is Sanctum bearer tokens.

The SPA's README on `main` has the full local-setup and deploy walkthrough for both halves.

## Quick start

```bash
composer install
cp .env.example .env          # set DB_*, CORS_ALLOWED_ORIGINS, SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD
php artisan key:generate
php artisan migrate
php artisan db:seed           # shop row + the Super Admin from SEED_ADMIN_*
php artisan serve             # http://localhost:8000
```

`composer setup` runs the same steps in one go. Counters, staff and products are then created from the app (Master menu), not seeded.

## Routes (`routes/api.php`)

| Method | Path | Who |
|---|---|---|
| POST | `/api/login` | anyone (throttled) |
| GET / POST | `/api/me`, `/api/logout` | signed in |
| GET | `/api/dashboard`, `/api/bills`, `/api/bills/find?id=`, `/api/products` | signed in, counter-scoped |
| POST | `/api/bills`, `/api/bills/cancel`, `/api/bills/reprint` | signed in, own counter |
| PUT | `/api/shop`, `/api/counters/{id}`, `/api/users/{id}`, `/api/users/{id}/password` | Super Admin |
| POST | `/api/counters`, `/api/users`, `/api/products`, `/api/products/import` | Super Admin |
| DELETE | `/api/products/{code}` | Super Admin |

Counter staff are locked to their own counter server-side; a Super Admin passes `?scope=<counterId>` or `all`.

## Production checklist

- `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://<api-domain>`
- `CORS_ALLOWED_ORIGINS=https://<spa-domain>` (comma-separated, no wildcard)
- `php artisan migrate --force && php artisan db:seed --force` once, **then** `php artisan config:cache && php artisan route:cache` — or, with no shell, open `https://<api-domain>/optimize` after each deploy (runs `optimize:clear` + `optimize`)
- Cron: `* * * * * php /path/to/api/artisan schedule:run` (prunes expired tokens and password resets daily)
