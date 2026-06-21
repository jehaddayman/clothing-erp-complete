# Clothing ERP — Backend

Production-ready REST API for a SaaS Accounting & Inventory Management System built for an online & offline clothing business.

## Stack

Node.js · Express · TypeScript · MongoDB (Mongoose) · JWT Auth · Winston · ExcelJS · PDFKit

## Modules

| Module | Base route |
|---|---|
| Auth (register/login/refresh/logout) | `/api/v1/auth` |
| Products | `/api/v1/products` |
| Inventory (stock in/out/adjust/damaged) | `/api/v1/inventory` |
| Customers | `/api/v1/customers` |
| Sales / Orders / Invoicing | `/api/v1/orders` |
| Suppliers / Purchase Orders | `/api/v1/suppliers` |
| Packaging | `/api/v1/packaging` |
| Shipping | `/api/v1/shipping` |
| Returns | `/api/v1/returns` |
| Accounting (Chart of Accounts, Journal, P&L, Balance Sheet) | `/api/v1/accounting` |
| Cash Flow | `/api/v1/cashflow` |
| Future Planning (targets, forecasts, KPIs) | `/api/v1/planning` |
| Dashboard | `/api/v1/dashboard` |
| Reports (Excel/PDF export) | `/api/v1/reports` |

## Roles

`admin` · `accountant` · `inventory_manager` · `sales_employee` — enforced via `protect` + `authorize(...roles)` middleware on every route.

## Getting Started

```bash
cp .env.example .env   # fill in real secrets
npm install
npm run dev             # http://localhost:5000
```

### Seed sample data

```bash
npm run seed
```

Creates an admin user (`admin@clothingerp.com` / `Admin@12345`), one user per role, default chart of accounts, 40 products, 10 customers, 4 suppliers, and ~15 sample orders.

### Build & run for production

```bash
npm run build
npm start
```

## Docker

```bash
docker build -t clothing-erp-backend .
docker run -p 5000:5000 --env-file .env clothing-erp-backend
```

Or from the repo root, bring up backend + MongoDB together:

```bash
docker compose up --build
```

## Railway Deployment

1. Push this repo to GitHub.
2. Create a new Railway project → "Deploy from GitHub repo" → select the `backend` directory as the service root.
3. Railway auto-detects `railway.json` and builds via the included `Dockerfile`.
4. Add environment variables in the Railway dashboard (see `.env.example`).
5. Provision a MongoDB instance (Railway plugin or MongoDB Atlas) and set `MONGO_URI`.
6. Deploy. Health check is available at `/health`.

## Architecture Notes

- **Transactions**: stock-affecting operations (order creation, PO receiving, inventory adjustments, return restocking) use MongoDB sessions/transactions so inventory counts and audit logs never drift apart.
- **Double-entry accounting**: journal entries are validated so total debits equal total credits before posting; account balances update according to normal-balance rules (debit-normal for assets/expenses, credit-normal for liabilities/equity/revenue).
- **RBAC**: enforced per-route, not just per-module — e.g. sales employees can create orders but only accountants can mark payment status.
