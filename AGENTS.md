# AGENTS.md — Samparka VPS Monorepo

This file is for agentic coding agents operating in this repository. Read it fully before making changes.

---

## Repository Structure

This is a **monorepo with no root-level `package.json`**. It contains two independent applications:

```
samparka_vps/
├── samparka-backend/    # Express.js REST API (Node.js, CommonJS)
└── samparka-frontend/   # React SPA (Vite, ES Modules)
```

Always run commands from within the appropriate subdirectory, not the repo root.

---

## Build, Dev & Lint Commands

### Frontend (`samparka-frontend/`)

```bash
yarn dev          # Start Vite dev server
yarn build        # Production build → dist/
yarn lint         # Run ESLint (eslint . )
yarn preview      # Preview production build locally
```

### Backend (`samparka-backend/`)

```bash
npm run dev       # Start with nodemon, NODE_ENV=development
npm run dev:prod  # Start with nodemon, NODE_ENV=production
npm start         # Production start via PM2 (NODE_ENV=production)
npm run seed      # Run database seed script
npm run backup    # Backup MongoDB to S3 (production)
npm run restore   # Restore from S3 (production)
```

### Testing

**There is no test suite.** No Jest, Vitest, Mocha, or any other test framework exists.
The backend `npm test` script simply starts the server under `NODE_ENV=test` — it is a placeholder only.
When asked to "run tests", run `yarn lint` in the frontend instead as the closest available check.

---

## Deployment

- **Backend**: GitHub Actions SSHs into VPS → `git pull` → `npm ci --production` → `pm2 reload ecosystem.config.js`
- **Frontend**: GitHub Actions builds on runner (Node 20, Yarn) → `rsync dist/` to `/www/wwwroot/samparka.co/` via SSH
- Triggers on push to `main` affecting `samparka-backend/**` or `samparka-frontend/**` respectively

---

## Architecture — Critical to Understand

The frontend is a **multi-tenant SPA**. It detects the subdomain at runtime and renders one of two completely different app trees:

- `samparka.co` → `MainApp` (admin/marketing portal — merchants, analytics, CRM)
- `<store>.samparka.co` → `AppStore` (per-store white-labeled loyalty experience for customers)

Every feature must consider both contexts. Route guarding is handled inline via `StoreProtectedRoute` / `StorePublicRoute` components inside `AppStore`.

**Authentication:** JWT tokens + user data stored in `js-cookie`, encrypted with AES via `crypto-js`. Decryption key comes from `import.meta.env.VITE_CLIENT_SECRET_KEY`.

---

## Backend Code Style (CommonJS JavaScript)

### Module System
- Strict `require()` / `module.exports` throughout — **no ES module `import`/`export`**
- Entry point: `src/index.js`

### File & Naming Conventions
- **Files**: `camelCase.js` preferred (e.g., `customerController.js`, `storeModel.js`). Some legacy `PascalCase.js` files exist — match the surrounding convention when editing.
- **Classes**: `PascalCase` (`CustomerController`, `StoreController`)
- **Variables**: `camelCase`, including Mongoose model references (e.g., `const customerModel = require(...)`)
- **Routes**: lowercase kebab or camelCase paths (e.g., `/customer`, `/api/visitAnalytics`)

### Controller Pattern
Controllers use ES2022 class syntax with arrow function methods for auto-binding:

```js
class CustomerController {
  register = async (req, res) => {
    try {
      // ...
      res.json({ success: true, message: "Registered successfully" });
    } catch (error) {
      console.error("❌ Register error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}
module.exports = new CustomerController();
```

### Error Handling
- Every controller method must use `try/catch`
- User-facing responses: `res.json({ success: true/false, message: "..." })`
- A `responseHandler.js` utility exists with proper HTTP status helpers (`success`, `error`, `notFound`, `unauthorized`, `serverError`) — prefer it for new code
- Developer logging: `console.error("❌ ...", error)` — emoji prefixes are the project convention

### Logging Convention
Use emoji-prefixed console statements (this is intentional project style):
- `console.log("✅ ...")` for success
- `console.error("❌ ...")` for errors
- `console.warn("⚠️ ...")` for warnings

### Import Order (Backend)
1. Node built-ins
2. Third-party packages (`express`, `mongoose`, etc.)
3. Internal models (`../models/...`)
4. Internal config (`../config/...`)
5. Internal utils/services (`../utils/...`, `../services/...`)

---

## Frontend Code Style (ES Module JSX)

### Module System
- Pure ES Modules — `import`/`export` everywhere
- File extension: `.jsx` for components, `.js` for utilities/config

### Component Style
- **Functional components only** — no class components
- Default export per file matches the filename (PascalCase)
- Custom hooks prefixed with `use` (`useAuth`, `useTheme`, `useStoreAuth`)

### File & Naming Conventions
- **Component/page files**: `PascalCase.jsx` (e.g., `CustomerLogin.jsx`, `StoreHome.jsx`)
- **Utility/config files**: `camelCase.js`
- **"Loyality"** (not "Loyalty") is the consistent spelling used across the entire codebase — do not "fix" this typo; it is used in file names, routes, and database fields

### Import Order (Frontend)
1. React and React hooks
2. Third-party libraries (`react-router-dom`, `@tanstack/react-query`, `sonner`, `lucide-react`, etc.)
3. Internal API config (`../api/config`)
4. Internal context (`../context/AuthContext`, `../context/ThemeContext`)
5. Internal components
6. Internal pages / sub-components
7. Internal hooks and utils

### Styling
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin — utility classes preferred
- Dark mode: `ThemeContext` provides `isDarkMode`; use `dark:` Tailwind variants and conditional class strings
- `cn()` utility from `clsx` + `tailwind-merge` for dynamic class merging (available in `src/lib/utils.js`)
- Custom fonts: `Poppins`, `Garet`, `Rubik`, `Montserrat`, `Inter` — all defined in Tailwind config
- Custom breakpoints: `lg1`, `md1`, `sm1` alongside standard Tailwind breakpoints

### State Management
- `useState` + `useEffect` for local component state
- `@tanstack/react-query` (v5) for server state / data fetching and caching
- React Context (`AuthContext`, `StoreAuthContext`, `ThemeContext`, `CartProvider`) for global state
- Avoid adding new global state solutions — use the existing patterns

### Error Handling (Frontend)
- User-facing errors: `toast.error("...")` from `sonner`
- Developer logging: `console.error(...)` inline
- API errors caught in `try/catch` blocks within event handlers or `useEffect`

### API Calls
- Use `axios` with the shared `api/config.js` base instance
- Always handle both success and error states

---

## Key Libraries Reference

| Concern | Library |
|---|---|
| UI components | Mantine v7, MUI v6 |
| Charts | Recharts, Mantine Charts |
| Animations | Framer Motion v12, GSAP v3 |
| Icons | Lucide React, MUI Icons |
| Notifications | Sonner (toasts) |
| Dates | `dayjs`, `date-fns` |
| Utilities | Lodash, `clsx`, `tailwind-merge` |
| QR codes | `qrcode.react`, `react-qr-scanner` |
| PDF | jsPDF |
| Offline | `idb` (IndexedDB) |
| Rich text | CKEditor 5 |

---

## What NOT to Do

- Do not add a root-level `package.json` or try to link the two packages
- Do not convert backend `require()` to ESM `import` — the backend is deliberately CommonJS
- Do not introduce TypeScript — neither project uses it (the `@types/*` devDependencies are for IDE intellisense only)
- Do not add a Prettier config or reformat existing files wholesale — there is no formatter configured
- Do not "fix" the spelling "Loyality" → "Loyalty" — it is used consistently in file names, routes, and DB fields
- Do not add new UI component libraries — Mantine and MUI are already present; use what exists
- Never create a component longer than 150 lines. If it exceeds this, split it into smaller components automatically. Always separate UI from logic.
