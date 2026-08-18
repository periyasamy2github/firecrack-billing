# Sparkline — Fireworks Shop Billing

A counter billing app for a single fireworks shop: GST tax invoices and bills of supply, thermal 80mm and A4 printing, per-counter scoping, a product catalogue with Excel import, and sales reports.

**Live demo:** https://periyasamy2github.github.io/firecrack-billing/

## Demo logins

Pick the account from the email dropdown on the sign-in screen — the password fills in for you, and any password is accepted (there is no backend yet).

| Email | Password | Role | What you see |
|---|---|---|---|
| `admin@sparkline.app` | `admin123` | Super Admin | Everything — all counters, Users, Counters, Settings |
| `user@sparkline.app` | `user123` | Counter Staff | Counter 1 only, straight to the dashboard |
| `multi@sparkline.app` | `multi123` | Counter Staff | Two counters, so the counter picker appears after sign-in |
| `jhone.doe@sparkline.app` | `wholesale123` | Counter Staff | Counter 3 (wholesale desk) |
| `inactive@sparkline.app` | — | Counter Staff | Deactivated — kept out of the sign-in list, visible on the Users page |

## What to try

1. Sign in as `admin@sparkline.app`, open **New Bill**, type an item code (`SPK-30`, `FLP-07S`, …) or use the barcode-scanner-friendly search, then `Enter` to add a line.
2. `F9` saves and prints, `F10` saves without printing. `F1` lists every shortcut.
3. Check **Bills** — the bill is there, the invoice number has advanced, and **Products** shows stock reduced by what you sold.
4. Cancel a bill from the Bills list — the stock goes back.
5. On the print screen: a **Tax Invoice** offers Thermal 80mm and A4; a **Bill of Supply** (GST switched off while billing) offers thermal only, since there is no tax invoice to raise.
6. **Reports** filters by date, counter and payment method, and exports CSV.
7. **Products → Import from Excel** validates every row before importing; the dialog has a downloadable template.

Data lives in your browser (`localStorage`), so a refresh keeps your bills and your session. Clearing site data resets everything to the seed.

## Running locally

```bash
npm install
npm run dev
```

Other scripts: `npm run build` (typecheck + production build), `npm run preview`, `npm run lint`.

## Stack

React 19 · TypeScript · Vite · MUI 6 · Redux Toolkit · React Router 7 · Recharts · Zod · SheetJS

## Known limitations

This is a front-end build; no backend is wired up yet.

- **Sign-in does not verify the password** — choosing the account is enough.
- **Dashboard KPIs and charts are sample figures**, not derived from the bills you create, so a new bill won't move "Sales today".
- Reprinting a bill does not increment its reprint counter.
- Renaming a counter does not rename it inside users already mapped to it.
- There is no test suite.
