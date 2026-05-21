# Claude.md — Samparka VPS Monorepo

This file is for agentic coding agents operating in this repository. Read it fully before making changes.

---

## 1. Repository Structure

This is a **monorepo with no root-level `package.json`**. It contains two independent applications:

```
samparka_vps/
├── samparka-backend/           # Express.js REST API (Node.js, CommonJS)
│   ├── src/
│   │   ├── index.js            # Entry point
│   │   ├── config/             # DB, cron, S3, cloudinary, SMTP, migration
│   │   ├── controllers/        # Business logic classes
│   │   ├── middlewares/        # Auth, store, upload, Razorpay webhook
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # Express routers
│   │   ├── services/           # WhatsApp, email, push notification helpers
│   │   ├── utils/              # responseHandler, distributedLock, seed, etc.
│   │   └── queue/              # BullMQ + IORedis setup
│   └── ecosystem.config.js     # PM2 config
└── samparka-frontend/          # React SPA (Vite, ES Modules)
    ├── src/
    │   ├── App.jsx             # Subdomain detection + root router
    │   ├── MainApp.jsx         # Admin/marketing portal routes
    │   ├── AppStore.jsx        # Per-store customer loyalty routes
    │   ├── api/config.js       # Axios base instance
    │   ├── context/            # AuthContext, StoreAuthContext, ThemeContext, CartProvider
    │   ├── lib/utils.js        # cn() helper (clsx + tailwind-merge)
    │   ├── components/         # Shared UI components
    │   ├── pages/              # MainApp page components
    │   ├── storePages/         # AppStore page components
    │   └── landingPage/        # Embedded landing page (separate React app tree)
    ├── vite.config.js
    ├── tailwind.config.js
    └── index.html              # Google Analytics G-YZ0KSMEY1W hardcoded here
```

Always run commands from within the appropriate subdirectory, not the repo root.

---

## 2. Build, Dev & Lint Commandss

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

## 3. Deployment

### Backend Workflow (`.github/workflows/deploy-backend.yml`)

- Triggers on push to `main` affecting `samparka-backend/**`
- SSHs into VPS at `/home/deploy/apps/samparka`
- Runs: `git pull` → `npm ci --production` → `pm2 reload ecosystem.config.js`

### Frontend Workflow (`.github/workflows/deploy-frontend.yml`)

- Triggers on push to `main` affecting `samparka-frontend/**`
- Builds on GitHub Actions runner (Node 20, Yarn)
- `rsync dist/` to `/www/wwwroot/samparka.co/` via SSH

### PM2 Config (`samparka-backend/ecosystem.config.js`)

- App name: `"samparka-backend"`, script: `"src/index.js"`
- `exec_mode: "fork"`, `instances: 1`, `TZ: "Asia/Kathmandu"`

---

## 4. Architecture — Critical to Understand

### Multi-Tenant SPA — Subdomain Detection

The frontend detects the subdomain at runtime in `src/App.jsx` and renders one of two completely different app trees:

```js
const hostname = window.location.hostname;
// localhost → use ?store= query param for dev
// samparka.co / www.samparka.co → subdomain = null → MainApp
// <store>.samparka.co → subdomain = parts[0] → AppStore
```

- `null`, `""`, or `"www"` → `MainApp` (admin/marketing portal)
- Any other subdomain → `AppStore` (per-store white-labeled loyalty experience)

Every feature must consider both contexts.

### Authentication

**Admin portal (MainApp):**

- `AuthContext` initializes asynchronously via `useEffect` → `loadAuthData()`
- Cookie names: `userInfo` (AES-encrypted JSON), `token` (plain JWT)
- AES decryption key: `import.meta.env.VITE_CLIENT_SECRET_KEY`
- Cookie expiry: 3650 days, `secure: true`, `sameSite: "Strict"`

**Store app (AppStore):**

- `StoreAuthContext` initializes **synchronously** via `useState(readAuthFromCookies)` — this prevents redirect races when customers land on QR/NFC URLs
- Includes cross-tab sync via `window.addEventListener("storage", ...)`

**Backend:**

- JWT tokens sent via `req.headers.token` — NOT `Authorization: Bearer`
- `authMiddleware.js` reads `req.headers.token`, looks up `userModel`, attaches `req.user`
- `storeMiddleware.js` looks up `storeModel`, checks subscription expiry and active status, attaches `req.store`

### Loyalty Program Formats

Five distinct loyalty card types exist:

- **L1**: Basic stamp card
- **L2**: Points-based tier system
- **L3**: Hybrid stamp + points
- **L34HA**: L3 variant with additional hotel/hospitality attributes
- **L4**: Multi-outlet points pooling
- **L5**: Outlet-specific points, monthly leaderboard, 3-month winners, Coffee Hero tracking

L5 config defaults (in `storeModel.js`):

- `redemptionThresholds`: [775, 1500, 2500, 5000, 8000, 10000, 50000]
- `leaderboardMinPoints`: 3000
- `coffeeHeroMinPoints`: 5000
- `initL5CronJobs()` is **commented out** in `index.js` — L5 leaderboard is computed real-time, not via cron

### Embedded Landing Page

`MainApp` has a catch-all route `/*` that renders `LandingApp`, which is a fully separate React app tree under `src/landingPage/`. It uses `react-helmet-async` and `react-router-dom` Routes internally. The main SPA does not use `react-helmet-async` outside of this landing page subtree.

---

## 5. Backend API Routes

All routes are mounted in `src/index.js`. The custom `token` header is required for all authenticated endpoints.

### Public / Auth Routes

| Method | Path                       | Middleware      | Description                         |
| ------ | -------------------------- | --------------- | ----------------------------------- |
| POST   | `/api/register`            | —               | Register new admin user             |
| POST   | `/api/login`               | —               | Admin login                         |
| POST   | `/api/store/register`      | —               | Register new store                  |
| GET    | `/api/store/:subdomain`    | —               | Get store data by subdomain         |
| GET    | `/api/manifest/:subdomain` | —               | Dynamic PWA manifest.json per store |
| POST   | `/api/customer/register`   | storeMiddleware | Customer register                   |
| POST   | `/api/customer/login`      | storeMiddleware | Customer login                      |
| POST   | `/api/customer/verify`     | storeMiddleware | OTP verification                    |

### Admin (authMiddleware required)

| Method              | Path                  | Description                                          |
| ------------------- | --------------------- | ---------------------------------------------------- |
| GET/PUT             | `/api/user`           | Get/update admin profile                             |
| GET/POST/PUT/DELETE | `/api/rewards`        | Reward CRUD                                          |
| GET/POST/PUT/DELETE | `/api/store/outlets`  | Outlet management                                    |
| GET/PUT             | `/api/store/settings` | Store settings                                       |
| GET                 | `/api/customers`      | List customers                                       |
| GET                 | `/api/analytics/*`    | Visit, tier, and engagement analytics                |
| GET/POST/PUT/DELETE | `/api/campaigns`      | Campaign management                                  |
| GET                 | `/api/whatsapp/*`     | WhatsApp messaging and templates                     |
| POST                | `/api/whatsapp/send`  | Enqueues to BullMQ `wa-message-queue`                |
| GET/POST            | `/api/billing`        | Subscription and billing                             |
| POST                | `/api/upload`         | File upload via Multer memoryStorage → S3/Cloudinary |

### Store Staff Routes (storeMiddleware required)

| Method   | Path                   | Description                   |
| -------- | ---------------------- | ----------------------------- |
| POST     | `/api/points/add`      | Add points for customer       |
| POST     | `/api/points/redeem`   | Redeem customer points/stamps |
| GET      | `/api/store/customers` | View store's customers        |
| GET/POST | `/api/reservations`    | Reservation management        |
| GET      | `/api/visit-analytics` | Visit counts                  |

### Razorpay

- Webhook endpoint registered **before** JSON body parsers (needs raw body for HMAC verification)
- HMAC verified with `RAZORPAY_WEBHOOK_SECRET`

---

## 6. Database Models (Mongoose)

### `storeModel.js`

Primary model. Key embedded schemas:

- `loyaltySchema`: format (L1–L5), stamps/points config, tier definitions
- `servicesSchema`: `loyalty`, `reservation`, `ecommerce` (with `status` + `deliveryCharge`), `games`, `multipleOutlets`, `leaderboard`, `onGoingOffers`, `powered`, `l5`
- `l5ConfigSchema`: redemption thresholds, leaderboard/Coffee Hero min points

Hooks:

- `pre("save")`: auto-manages `status` based on `subscriptionEndDate`
- `post(/^find/)`: auto-deactivates expired stores on read

### `customerModel.js`

- Per-store customer record
- Fields: `phone`, `name`, `storeId`, `points`, `stamps`, `tier`, `birthday`, `visits`, `lastVisit`, `loyalityCardFormat`, `outletPoints` (L5), `notifications`, `pushSubscriptions`

### `userModel.js`

- Admin user (merchant account)
- Fields: `email`, `password` (bcrypt), `storeId`, `role`

### `pointsModel.js`

- Transaction log for every points add/redeem event
- Fields: `customerId`, `storeId`, `outletId`, `type`, `amount`, `balance`, `staffId`, `createdAt`

### `rewardModel.js`

- Redeemable rewards defined per store
- Fields: `storeId`, `name`, `pointsCost`, `stampsCost`, `quantity`, `expiryDate`, `isActive`

### `campaignModel.js`

- Marketing campaign records
- Fields: `storeId`, `name`, `type`, `status`, `scheduledAt`, `targetSegment`, `message`, `whatsappTemplateId`

### `reservationModel.js`

- Customer reservations
- Fields: `storeId`, `customerId`, `date`, `time`, `partySize`, `status`, `notes`

### `whatsappOutgoing.js` / `mailSMSModel.js`

- Log records for sent WhatsApp messages and email/SMS campaigns
- Both have `owner` field backfilled by startup migration

### `productModel.js`, `orderModel.js`, `cartModel.js`

- E-commerce subfeature (enabled per store via `services.ecommerce.status`)
- Cart state also persisted client-side via IndexedDB (`idb`)

### `notificationModel.js`

- Push notification records
- VAPID keys configured from env vars; web push dispatched via `web-push` package

---

## 7. Middleware

| File                  | Purpose                                                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `authMiddleware.js`   | Reads `req.headers.token`, verifies JWT, attaches `req.user` from `userModel`                                                 |
| `storeMiddleware.js`  | Reads store identifier from request, looks up `storeModel`, checks `subscriptionEndDate` and `isActive`, attaches `req.store` |
| `uploadMiddleware.js` | Multer with `memoryStorage` (never disk storage) — always in-memory before forwarding to S3/Cloudinary                        |
| `razorpayWebhook.js`  | Raw body capture before JSON middleware for HMAC signature verification                                                       |

---

## 8. Config Files (`samparka-backend/src/config/`)

| File                  | Purpose                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `db.js`               | Mongoose connect to `MONGO_URI`                                                                                                      |
| `cornJob.js`          | 8 cron schedules (see section below); daily report and expiry notification use distributed Redis lock                                |
| `s3Config.js`         | AWS SDK v3 S3Client configured for Scality-compatible storage — **requires `forcePathStyle: true`** (not AWS S3 proper)              |
| `cloudinaryConfig.js` | Cloudinary SDK configured from env vars                                                                                              |
| `smtpConfig.js`       | Nodemailer transporter using `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`                                                      |
| `migration.js`        | Startup migration: backfills `owner` on `WhatsappOutgoing` and `mailSMSModel`, backfills `establishedYear` on `storeModel`           |
| `distributedLock.js`  | Redis-based distributed lock using IORedis (same connection as BullMQ) — prevents duplicate cron execution on multi-process restarts |

### Cron Job Schedule (`cornJob.js`)

8 scheduled jobs:

1. **Daily report** — configurable time, distributed lock, sends merchant daily summary
2. **Expiry notification** — configurable time, distributed lock, notifies customers of expiring points/stamps
3. **Tier demotion** — periodic check, downgrades customers who have fallen below tier thresholds
4. **Birthday emails** — daily, sends birthday messages to customers
5. **Campaign processing** — frequent interval, processes scheduled campaigns
6. **L5 leaderboard** — defined but `initL5CronJobs()` is **commented out**; leaderboard is computed real-time
7. **DB backup** — scheduled S3 backup (production)
8. **Subscription expiry** — checks and updates store subscription statuses

`rescheduleReport()` and `rescheduleExpiryNotification()` allow dynamic rescheduling at runtime.

---

## 9. Queue System

- **Library**: BullMQ with IORedis
- **Queue name**: `"wa-message-queue"`
- **Connection**: `REDIS_HOST` + `REDIS_PORT` required — server exits on startup if missing
- The IORedis `connection` export is shared between BullMQ and `distributedLock.js`
- Workers process WhatsApp message jobs asynchronously

---

## 10. Frontend Routing

### `AppStore.jsx` — Per-Store Customer Routes

Route guards defined inline:

- `StoreProtectedRoute`: checks `requiredService` flag against `storeData.services`; saves intended URL to `sessionStorage.postLoginRedirect` for `loyality/*` paths before redirecting to login
- `StorePublicRoute`: redirects authenticated users away from login/register

Public routes:

- `/` — Store home
- `/verification` — Phone OTP verification
- `/store/login` — Customer login
- `/spin-the-wheel` — Spin wheel game (no auth required)

Protected customer routes:

- `/loyality`, `/loyality/:pointsId`, `/loyality/:storeId/:outletId`
- `/loyality/scan/:pointsId` — QR scan landing
- `/tier`, `/profile`, `/notifications`, `/pointHistory`
- `/ProfileSetting`, `/myRewards`, `/offers`
- `/myReservations`, `/reservation`, `/reservationForm`
- `/leaderboard`, `/l5`, `/games`, `/games/whack-a-mole`

Store staff routes:

- `/store/points`, `/store/viewRewards`, `/store/viewReservations`
- `/store/scanQr`, `/store/history`, `/store/visit-analytics`
- `/store/customers`, `/store/l5`

Conditional e-commerce routes (when `storeData.services?.ecommerce?.status === true`):

- `/products/*` — Product listing, detail, cart, checkout

### `MainApp.jsx` — Admin Portal Routes

Route guards defined inline:

- `ProtectedRoute`: requires valid admin auth cookie
- `StoreSubscriptionRoute`: requires active store subscription
- `PublicRoute`: redirects authenticated users away from login

Key admin routes:

- `/login`, `/register`, `/forgot-password`
- `/dashboard` — Overview analytics
- `/store-settings`, `/store-settings/*` — Store configuration
- `/customers`, `/customers/:id` — Customer management
- `/rewards` — Reward catalog management
- `/campaigns`, `/campaigns/create`, `/campaigns/:id` — Campaign management
- `/analytics/*` — Multiple analytics views
- `/whatsapp`, `/whatsapp/*` — WhatsApp integration
- `/billing`, `/billing/*` — Subscription management
- `/outlets`, `/outlets/*` — Multi-outlet management
- `/staff`, `/staff/*` — Staff account management
- `/flyer`, `/flyer/*` — Marketing flyer generator
- `/*` — Catch-all renders `LandingApp` (embedded landing page)

---

## 11. Frontend Contexts

### `AuthContext` (`src/context/AuthContext.jsx`)

- Async initialization via `useEffect` → `loadAuthData()`
- Decrypts `userInfo` cookie using `CryptoJS.AES.decrypt` with `VITE_CLIENT_SECRET_KEY`
- Provides: `user`, `token`, `isAuthenticated`, `login()`, `logout()`

### `StoreAuthContext` (`src/context/StoreAuthContext.jsx`)

- **Synchronous** initialization: `useState(readAuthFromCookies)` — called at module load time
- Prevents redirect race conditions for deep-linked QR/NFC URLs
- Cross-tab sync: `window.addEventListener("storage", handler)`
- Provides: `storeUser`, `storeToken`, `storeData`, `isStoreAuthenticated`, `storeLogin()`, `storeLogout()`

### `ThemeContext`

- Provides `isDarkMode`, `toggleTheme()`
- Persisted to localStorage
- Use `dark:` Tailwind variants and conditional class strings based on `isDarkMode`

### `CartProvider`

- Manages e-commerce cart state
- Persisted to IndexedDB via `idb` for offline capability

---

## 12. API Configuration

`src/api/config.js`:

```js
export default axios.create({ baseURL: import.meta.env.VITE_SERVER_BASE_URL });
```

- No interceptors — auth token must be passed manually per request as `headers: { token: ... }`
- Always use this instance (never raw `axios`) for all API calls

---

## 13. Environment Variables

### Frontend (`VITE_` prefix required for Vite exposure)

| Variable                 | Purpose                                                |
| ------------------------ | ------------------------------------------------------ |
| `VITE_SERVER_BASE_URL`   | Backend API base URL                                   |
| `VITE_CLIENT_SECRET_KEY` | AES decryption key for auth cookies                    |
| `VITE_RAZORPAY_KEY_ID`   | Razorpay public key for frontend payment form          |
| `VITE_FIREBASE_*`        | Firebase config for push notifications (multiple keys) |

### Backend (`process.env`)

| Variable                  | Purpose                                         |
| ------------------------- | ----------------------------------------------- |
| `PORT`                    | Server port (default: 8000)                     |
| `MONGO_URI`               | MongoDB connection string                       |
| `JWT_SECRET`              | JWT signing secret                              |
| `NODE_ENV`                | `development` / `production` / `test`           |
| `REDIS_HOST`              | Redis host (required — server exits if missing) |
| `REDIS_PORT`              | Redis port (required — server exits if missing) |
| `S3_ENDPOINT`             | Scality S3-compatible endpoint URL              |
| `S3_ACCESS_KEY`           | S3 access key                                   |
| `S3_SECRET_KEY`           | S3 secret key                                   |
| `S3_REGION`               | S3 region                                       |
| `S3_BUCKET`               | S3 bucket name (value: `"samparka"`)            |
| `CLOUDINARY_CLOUD_NAME`   | Cloudinary cloud name                           |
| `CLOUDINARY_API_KEY`      | Cloudinary API key                              |
| `CLOUDINARY_API_SECRET`   | Cloudinary API secret                           |
| `SMTP_HOST`               | SMTP server hostname                            |
| `SMTP_PORT`               | SMTP server port                                |
| `SMTP_USER`               | SMTP authentication username                    |
| `SMTP_PASS`               | SMTP authentication password                    |
| `RAZORPAY_KEY_ID`         | Razorpay API key                                |
| `RAZORPAY_KEY_SECRET`     | Razorpay API secret                             |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook HMAC secret                    |
| `VAPID_PUBLIC_KEY`        | Web push VAPID public key                       |
| `VAPID_PRIVATE_KEY`       | Web push VAPID private key                      |
| `VAPID_EMAIL`             | Web push VAPID contact email                    |
| `WHATSAPP_API_URL`        | WhatsApp Business API base URL                  |
| `WHATSAPP_TOKEN`          | WhatsApp Business API bearer token              |
| `CLIENT_URL`              | Frontend base URL (for CORS and email links)    |

---

## 14. Styling Reference

### Tailwind CSS v4

- Plugin: `@tailwindcss/vite` in `vite.config.js`
- Additional plugin: `@tailwindcss/typography` in `tailwind.config.js`

### Custom Fonts (Tailwind `fontFamily`)

| Class             | Font       |
| ----------------- | ---------- |
| `font-poppins`    | Poppins    |
| `font-garet`      | Garet      |
| `font-h1`         | Inter      |
| `font-rubik`      | Rubik      |
| `font-montserrat` | Montserrat |

### Custom Breakpoints

| Class          | Condition                          |
| -------------- | ---------------------------------- |
| `lg1:`         | max-width: 1200px                  |
| `md1:`         | max-width: 960px                   |
| `sm1:`         | max-width: 420px                   |
| `mq350small1:` | max-width: 350px (raw media query) |

### Custom Colors

- `seagreen-100`: `#016e49`, `seagreen-200`: `rgba(1, 110, 73, 0.31)`
- `whitesmoke-100`: `#f1f4f7`, `whitesmoke-200`: `#f2f2f2`
- `darkgray-100`: `#9ea1a1`, `darkgray-200`: `#969696`
- `darkslategray`: `#0b2b23`
- `red1`: `#ff0004`, `lime1`: `#00ff00`
- `sienna`: `rgba(139, 61, 61, 0.25)`

### Custom Animations

- `animate-pulseCircle` — scale pulse (2s infinite)
- `animate-spinCircle` — 360° rotation (2s linear infinite)
- `animate-glow` — green box-shadow glow (1.5s alternate)
- `animate-shine` — translateX shine sweep (3s infinite)

### `cn()` Utility

```js
import { cn } from "@/lib/utils"; // in landingPage
import { cn } from "../../lib/utils"; // elsewhere
```

---

## 15. Backend Code Style (CommonJS JavaScript)

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
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };
}
module.exports = new CustomerController();
```

### Error Handling

- Every controller method must use `try/catch`
- User-facing responses: `res.json({ success: true/false, message: "..." })`
- A `responseHandler.js` utility exists with HTTP status helpers (`success`, `error`, `notFound`, `unauthorized`, `serverError`) — prefer it for new code
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

### Backend Boot Sequence (`src/index.js`)

1. Register Razorpay webhook route (before JSON body parsers)
2. Apply CORS (hardcoded allowed origins array with regex for `*.samparka.co`)
3. Apply JSON body parsers
4. Mount all other routes
5. `connectDB()` → `runMigrations()` → `restoreReportSchedule()` → `app.listen(PORT)`

---

## 16. Frontend Code Style (ES Module JSX)

### Module System

- Pure ES Modules — `import`/`export` everywhere
- File extension: `.jsx` for components, `.js` for utilities/config

### Component Style

- **Functional components only** — no class components
- Default export per file matches the filename (PascalCase)
- Custom hooks prefixed with `use` (`useAuth`, `useTheme`, `useStoreAuth`)
- **Never create a component longer than 150 lines** — split into smaller components automatically; always separate UI from logic

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
- Pass auth token manually: `headers: { token: cookieValue }`
- Always handle both success and error states

---

## 17. Key Libraries Reference

### Frontend

| Concern                    | Library                            |
| -------------------------- | ---------------------------------- |
| UI components              | Mantine v7, MUI v6                 |
| Charts                     | Recharts, Mantine Charts           |
| Animations                 | Framer Motion v12, GSAP v3         |
| Icons                      | Lucide React, MUI Icons            |
| Notifications              | Sonner (toasts)                    |
| Dates                      | `dayjs`, `date-fns`                |
| Utilities                  | Lodash, `clsx`, `tailwind-merge`   |
| QR codes                   | `qrcode.react`, `react-qr-scanner` |
| PDF                        | jsPDF                              |
| Offline / cart persistence | `idb` (IndexedDB)                  |
| Rich text                  | CKEditor 5                         |
| SEO (landing page only)    | `react-helmet-async`               |
| Routing                    | `react-router-dom` v6              |
| HTTP                       | `axios`                            |
| Auth cookie encryption     | `js-cookie` + `crypto-js`          |
| Push notifications         | Firebase (`firebase` SDK)          |

### Backend

| Concern            | Library                                                  |
| ------------------ | -------------------------------------------------------- |
| Framework          | Express.js                                               |
| Database           | Mongoose (MongoDB)                                       |
| Auth               | `jsonwebtoken`, `bcryptjs`                               |
| Queue              | BullMQ + IORedis                                         |
| File upload        | Multer (memoryStorage only)                              |
| Object storage     | AWS SDK v3 (Scality S3-compatible, forcePathStyle: true) |
| Image CDN          | Cloudinary SDK                                           |
| Email              | Nodemailer                                               |
| SMS/WhatsApp       | Custom HTTP client to WhatsApp Business API              |
| Push notifications | `web-push` (VAPID)                                       |
| Payments           | Razorpay SDK                                             |
| Scheduling         | `node-cron`                                              |
| Process management | PM2                                                      |

---

## 18. SEO & Public Assets

- **Google Analytics**: `G-YZ0KSMEY1W` hardcoded in `samparka-frontend/index.html`
- **PWA manifest**: Dynamically generated per-store by backend at `/api/manifest/:subdomain`
- **react-helmet-async**: Used only within `src/landingPage/` subtree — not in MainApp or AppStore
- **Sitemap / robots.txt**: Served as static files from `samparka-frontend/public/` (if present)
- **S3 bucket**: Named `"samparka"` on a Scality-compatible endpoint (not AWS)

---

## 19. What NOT to Do

- Do not add a root-level `package.json` or try to link the two packages
- Do not convert backend `require()` to ESM `import` — the backend is deliberately CommonJS
- Do not introduce TypeScript — neither project uses it (the `@types/*` devDependencies are for IDE intellisense only)
- Do not add a Prettier config or reformat existing files wholesale — there is no formatter configured
- Do not "fix" the spelling "Loyality" → "Loyalty" — it is used consistently in file names, routes, and DB fields
- Do not add new UI component libraries — Mantine and MUI are already present; use what exists
- Never create a component longer than 150 lines — split automatically and always separate UI from logic
- Do not use `Authorization: Bearer <token>` header — the backend reads `req.headers.token` (lowercase `token` header)
- Do not use `forcePathStyle: false` when configuring S3 — the storage backend is Scality-compatible and requires `forcePathStyle: true`
- Do not use disk storage with Multer — always use `memoryStorage()`
- Do not add a second `axios.create()` instance — use the shared `src/api/config.js` instance
- Do not enable `initL5CronJobs()` — it is intentionally commented out; L5 leaderboard is real-time
- Do not add `react-helmet-async` outside of the landing page subtree (`src/landingPage/`)
- Do not change the PM2 `exec_mode` to `cluster` — it is intentionally `fork` with `instances: 1`
- Do not use AWS S3 bucket `us-east-1` defaults — always configure the custom `S3_ENDPOINT`

## 20. SEO — Current State, Problems & Fix Targets

### Architecture note for SEO

- Frontend is a Vite React SPA — Googlebot sees a blank shell, not content
- `samparka.co` → MainApp → needs full SEO treatment
- `*.samparka.co` → AppStore (merchant PWAs) → must be noindexed, never touched for SEO
- `react-helmet-async` exists ONLY in `src/landingPage/` — do not add it anywhere else
- Static files go in `samparka-frontend/public/` — Vite copies them to `dist/` automatically
- SEO skill file lives at: `samparka-frontend/seo/SKILL.md` — read it before any SEO work

### Known problems — fix in this exact order

| #   | Problem                                      | File                                   | Status       |
| --- | -------------------------------------------- | -------------------------------------- | ------------ |
| 1   | Merchant subdomains indexed by Google        | `samparka-backend/src/index.js`        | ❌ Not fixed |
| 2   | No robots.txt                                | `samparka-frontend/public/robots.txt`  | ❌ Not fixed |
| 3   | No sitemap.xml                               | `samparka-frontend/public/sitemap.xml` | ❌ Not fixed |
| 4   | Wrong title, no canonical, no OG, no JSON-LD | `samparka-frontend/index.html`         | ❌ Not fixed |
| 5   | samparka.info not redirecting to samparka.co | Nginx config on VPS                    | ❌ Not fixed |
| 6   | No /blog route or content system             | `MainApp.jsx` + new files              | ❌ Not fixed |
| 7   | Googlebot sees blank SPA shell               | `samparka-backend/src/index.js`        | ❌ Not fixed |

Update status column as each fix is confirmed working.

### Target Express middleware order in index.js

After SEO fixes the order must be:

1. Razorpay webhook (raw body — must stay first, do not move)
2. noindex middleware for merchant subdomains ← new
3. prerender-node middleware ← new, add last
4. CORS middleware
5. JSON body parsers
6. All other routes

### noindex middleware — exact code

Insert AFTER Razorpay webhook, BEFORE everything else:

```js
// SEO: noindex all merchant subdomain requests
app.use((req, res, next) => {
  const host = req.hostname || "";
  const isMain = host === "samparka.co" || host === "www.samparka.co";
  if (!isMain) res.setHeader("X-Robots-Tag", "noindex, nofollow");
  next();
});
```

### Target index.html title and description

```
Title (58 chars):
Branded Loyalty App or WhatsApp Loyalty | Samparka

Description (156 chars):
Turn first-time customers into regulars with your own loyalty app or WhatsApp rewards. Easy setup live in minutes.
```

### Blog content system — file locations once created

```
samparka-frontend/src/content/blog/index.js         — imports all posts
samparka-frontend/src/content/blog/[slug].js        — one file per post
samparka-frontend/src/pages/Blog.jsx                — /blog list page
samparka-frontend/src/pages/BlogPost.jsx            — /blog/:slug page
samparka-frontend/seo/SKILL.md                      — SEO skill for Claude Code
```

Blog routes go in MainApp.jsx BEFORE the /\* catch-all:

```jsx
<Route path="/blog" element={<Blog />} />
<Route path="/blog/:slug" element={<BlogPost />} />
// /* catch-all must stay last
```

### Verification commands — run after every fix

```bash
# Fix 1
curl -I https://burgersaga.samparka.co | grep -i x-robots
# Fix 2
curl https://samparka.co/robots.txt
# Fix 3
curl https://samparka.co/sitemap.xml
# Fix 4
curl -s https://samparka.co | grep -o '<title>[^<]*'
curl -s https://samparka.co | grep canonical
curl -s https://samparka.co | grep 'og:title'
curl -s https://samparka.co | grep 'application/ld+json'
# Fix 5
curl -I http://samparka.info
# Fix 6
curl -s -o /dev/null -w "%{http_code}" https://samparka.co/blog
# Fix 7
curl -A "Googlebot" https://samparka.co | grep '<title>'
```

### SEO do-not-touch rules

- Do NOT add noindex to samparka.co itself — only to \*.samparka.co
- Do NOT add react-helmet-async to MainApp.jsx or AppStore.jsx
- Do NOT touch any AppStore files for SEO
- Do NOT put blog routes after the /\* catch-all
- Do NOT remove Google Analytics tag G-YZ0KSMEY1W from index.html
- Do NOT enable initL5CronJobs() — unrelated, leave commented out
- Do NOT forget to update sitemap.xml after each new blog post

---

## 21. Blog System Architecture

### File locations

| File | Purpose |
|---|---|
| `samparka-frontend/src/landingPage/src/pages/Blog.jsx` | Blog listing page (`/blog`) |
| `samparka-frontend/src/landingPage/src/pages/BlogPost.jsx` | Individual post page (`/blog/:slug`) |
| `samparka-frontend/src/landingPage/src/components/blogPosts/index.js` | Post registry + helper functions |
| `samparka-frontend/src/landingPage/src/components/blogPosts/*.jsx` | One file per post (exports a plain JS object) |

### How the blog listing works (`Blog.jsx`)

- Contains its **own hardcoded `blogPosts` array** (6 posts) defined directly inside the component — **NOT imported from `blogPosts/index.js`**
- One post has `featured: true` (currently `caffeophilia-case-study`) — rendered as a large hero card above the grid
- All others are rendered in a 3-column responsive grid
- No search, no filter, no pagination — posts are static

### How individual posts work (`BlogPost.jsx`)

- Reads `slug` from the URL via `useParams()`
- Calls `getPostBySlug(slug)` imported from `blogPosts/index.js`
- Post content is stored as raw HTML in each post object's `content` field, rendered via `dangerouslySetInnerHTML`
- Renders `getRelatedPosts(post.id, 3)` at the bottom as "More Stories"

### Post registry (`blogPosts/index.js`)

- Imports all post objects and exports them as the `blogPosts` array
- Exports three helper functions:
  - `getPostById(id)` — find by numeric id
  - `getPostBySlug(slug)` — find by URL slug (used by `BlogPost.jsx`)
  - `getRelatedPosts(currentPostId, limit)` — all posts except current, up to `limit`

### ⚠️ Known inconsistency — Blog.jsx and index.js are out of sync

`blogPosts/index.js` registers **8 posts** (includes `GamificationPost` and `PsychologyOfLoyalty`).
`Blog.jsx` only lists **6 posts** in its own hardcoded array (does not include those two).

This means:
- `GamificationPost` and `PsychologyOfLoyalty` are **not shown** on the `/blog` listing page
- But they **can be reached directly** via `/blog/<their-slug>` if you know the URL, because `BlogPost.jsx` looks them up from `index.js`
- When adding a new post, you must update **both** `Blog.jsx`'s array AND `blogPosts/index.js` — and also `sitemap.xml`

### There is no blog search

No search input, no filter by category, no client-side search logic exists anywhere in the blog. If search is needed it must be built from scratch in `Blog.jsx` using a `useState` filter over the `blogPosts` array.
