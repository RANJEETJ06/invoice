# Adija Invoice

Invoice management system for **ADIJA TRADEX** — runs as a web app *or* a Windows desktop app (`.exe`).
Built with Express + MongoDB Atlas + React (Vite + Tailwind) + Electron.

## Features

- Dashboard with totals, monthly chart, status breakdown, recent invoices
- Invoice CRUD with auto-numbered invoices, GST split (CGST/SGST/IGST), transport/other charges, auto round-off, amount-in-words (Indian system)
- **Vehicle Details** section (Vehicle No, Driver Name, Driver Contact) on every invoice
- Print-ready A4 invoice view matching the Adija Tradex template
- Customer (buyer) management with GSTIN
- Product catalog with HSN code, default unit, default rate
- Company settings (your details + bank details) printed on every invoice

## Prerequisites

- **Node.js 18+** (`node --version`)
- A MongoDB connection string. Configure it in `.env` (copy from `.env.example`).

```powershell
copy .env.example .env
# then edit .env and set MONGODB_URI
```

`.env` is gitignored — never commit secrets.

## Install

From `D:\projects\fast\invoice-3`:

```powershell
npm install
```

The root `postinstall` script installs both `server/` and `client/` dependencies automatically.

## Run

### Dev (web + Electron together, hot reload)
```powershell
npm run dev
```
Opens the Electron window pointing at the Vite dev server. Express API on `:4000`, Vite on `:5173`.

### Dev (web only — no Electron)
```powershell
npm run dev:web
```
Then open http://localhost:5173

### Web production
```powershell
npm run build:client
npm run start:web
```
Express serves the built client at http://localhost:4000.

### Build Windows installer (`.exe`)
```powershell
npm run build:exe
```
Output: `dist-electron\AdijaInvoice-Setup-1.0.0.exe`.
This builds the React client, then bundles the server + Electron + `config.json` into an NSIS installer.

## Configuration

All config lives in `.env` (project root). The server loads it at startup; real environment variables always take precedence — handy for hosting (Heroku, Render, Docker, systemd).

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/
MONGODB_DB=adija_invoice
PORT=4000
```

For the packaged `.exe`, `.env` is bundled as an `extraResource`. To change DB credentials after install, edit `resources\.env` inside the install directory (e.g. `C:\Program Files\Adija Invoice\resources\.env`) and restart the app. Override the path with `ENV_PATH` if needed.

## Project layout

```
invoice-3/
├─ package.json          # root scripts, electron-builder config
├─ .env                  # MongoDB credentials (gitignored)
├─ .env.example          # template, safe to commit
├─ server/               # Express + Mongoose API
│  ├─ server.js
│  ├─ db.js, config.js
│  ├─ models/            # Invoice, Customer, Product, Company
│  └─ routes/            # invoices, customers, products, companies, stats
├─ client/               # React + Vite + Tailwind
│  └─ src/pages/         # Dashboard, InvoiceList, InvoiceForm, InvoiceView, ...
└─ electron/             # main.js, preload.js
```

## API

| Endpoint | Notes |
|---|---|
| `GET /api/invoices` | list (filters: `q`, `status`, `from`, `to`) |
| `GET /api/invoices/next-number` | next auto-number `AT/YYYY/0001` |
| `POST /api/invoices` | create (server computes totals, GST, words) |
| `PUT /api/invoices/:id` | update |
| `DELETE /api/invoices/:id` | delete |
| `GET/POST/PUT/DELETE /api/customers` | buyer CRUD |
| `GET/POST/PUT/DELETE /api/products` | catalog CRUD |
| `GET/PUT /api/companies/default` | seller + bank details |
| `GET /api/stats/dashboard` | totals, monthly, recent |

## Notes

- The first time you load Company Settings, the default Adija Tradex profile is seeded from the GSTIN and address you provided.
- Round-off is automatic: `grandTotal = round(taxable + GST + charges)`, and the difference is recorded as `roundOff`.
- Amount in words follows the Indian numbering system (Lakh / Crore).
- The print view is A4 with print CSS — use the browser's "Save as PDF" or Ctrl+P.
