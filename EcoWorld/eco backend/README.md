# EcoMind Backend

Express + MongoDB REST API for the EcoMind smart waste management app —
authentication with role-based access (admin vs. citizen/"viewer"),
AI (Gemini) photo classification, GPS → zone resolution, and automatic
collection-team dispatch.

## Folder structure

```
ecomind-backend/
├── server.js                    # entry point
├── src/
│   ├── app.js                    # express app, middleware, route mounting
│   ├── config/db.js              # mongoose connection
│   ├── models/                   # Mongoose schemas
│   ├── controllers/              # route handler logic
│   ├── routes/                   # express routers, one per feature (auth-protected)
│   ├── middleware/               # auth (JWT + role guard), upload, error handling
│   ├── services/
│   │   ├── aiService.js          # ALL Gemini calls live here (+ mock fallback)
│   │   ├── geoService.js         # reverse geocoding (Google Maps, + no-key fallback)
│   │   └── dispatchService.js    # auto-assigns a collection vehicle to new reports
│   └── utils/                    # asyncHandler, ApiError, seed script, make-admin script
├── uploads/                       # uploaded images (served at /uploads/*)
├── .env.example
└── package.json
```

## 1. Install & run

```bash
cd ecomind-backend
npm install
cp .env.example .env      # then fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY, etc.
npm run seed               # optional: seeds bins/vehicles/zones (infrastructure only, no fake reports)
npm run dev                # starts on http://localhost:5000
```

Health check: `GET http://localhost:5000/api/health`

## 2. Set up your admin account (kanwarzen642@gmail.com)

There are two ways — either works, and they stay in sync:

**A. Automatic (recommended).** In `.env`, set:
```
ADMIN_EMAILS=kanwarzen642@gmail.com
```
Now simply register that email through the app's normal sign-up form (or `POST /api/auth/register`). It is automatically created with `role: "admin"` — no extra step needed. This also self-heals on every login: if that account's role ever drifts, logging in resets it to admin.

**B. Manual command**, if the account already exists or you want to force it right now:
```bash
npm run make-admin -- kanwarzen642@gmail.com
```
- If the account exists, it's promoted to admin immediately.
- If it doesn't exist yet, a new admin account is created and a temporary password is printed to the terminal — log in with it, then treat it as the account's password (there's no separate change-password endpoint yet).

You can add more admins the same way, or extend `ADMIN_EMAILS` with a comma-separated list.

## 3. How a citizen report becomes a dispatch (the core flow)

`POST /api/reports` (multipart form, requires a Bearer token):

1. Citizen uploads a **photo** (`image`) + their **GPS coordinates** (`lat`, `lng`, from the browser's Geolocation API) + a short `description`.
2. The photo is sent to **Gemini** (`src/services/aiService.js`) for classification: detected item, category, confidence, recyclability, hazard flag, disposal recommendation. Falls back to a realistic mock if no `GEMINI_API_KEY` is set.
3. The coordinates are **reverse-geocoded** into a zone/address (`src/services/geoService.js`) using the Google Maps Geocoding API if `GOOGLE_MAPS_API_KEY` is set, otherwise a deterministic fallback grid.
4. A **collection vehicle is auto-dispatched** to that zone (`src/services/dispatchService.js`) — an idle/en-route vehicle already assigned there is reused, or a new one is spun up. The report's status flips to `Assigned` and the response includes which vehicle is coming and its route.
5. The report (with AI analysis + location + dispatch info) is saved and immediately reflected in the dashboard's real aggregate numbers — nothing here is hardcoded.

## 4. Roles & access

| Role | Set by | Can see |
|---|---|---|
| `citizen` (shown as **Viewer** in the UI) | default for everyone who signs up | Their **own** reports (`GET /api/reports/mine`), their own contribution stats (`GET /api/reports/my-impact`), and city-wide **aggregate** analytics (`/api/dashboard/*`, `/api/bins`, `/api/predictions`) |
| `admin` | `ADMIN_EMAILS` in `.env`, or `npm run make-admin` | Everything a viewer sees, **plus** every report from every citizen in every zone (`GET /api/reports`), fleet/vehicle management, illegal-dumping management, and the AI database assistant |

A client can never self-assign `role` on registration — it's resolved server-side.

## 5. API reference

| Area | Endpoints | Access |
|---|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` | public / signed-in |
| Reports (core flow) | `POST /api/reports` (multipart: `image`, `lat`, `lng`, `description`) | any signed-in user |
| | `GET /api/reports/mine`, `GET /api/reports/my-impact` | any signed-in user |
| | `GET /api/reports`, `PATCH /api/reports/:id/status` | admin/staff |
| | `GET /api/reports/:id` | owner or admin/staff |
| AI Waste Scanner (identify only, no dispatch) | `POST /api/scanner/analyze` (multipart `image`), `GET /api/scanner/history` | any signed-in user |
| | `GET /api/scanner/categories` | public |
| Dashboard analytics | `GET /api/dashboard/stats`, `/charts`, `/insights` | any signed-in user |
| Smart Bins | `GET /api/bins`, `GET /api/bins/:id` | any signed-in user |
| | `POST/PATCH/DELETE /api/bins...` | admin/staff |
| Waste Prediction | `GET /api/predictions` | any signed-in user |
| Smart Collection (fleet) | `GET /api/collection/vehicles...` | any signed-in user |
| | `POST/PATCH/DELETE /api/collection/vehicles...` | admin/staff |
| Illegal Dumping | `POST /api/dumping-reports` (multipart) | any signed-in user |
| | `GET /api/dumping-reports/mine` | any signed-in user |
| | `GET /api/dumping-reports`, `PATCH .../status` | admin/staff |
| AI Database Assistant | `POST /api/assistant/ask` | admin/staff |

All list endpoints return `{ success, count, data }`. All errors return `{ success: false, message }`. Authenticated requests need `Authorization: Bearer <token>` (the token from register/login).

## 6. Connecting the frontend

The paired `ecomind-frontend` project's `services/api.js` already points at `VITE_API_BASE_URL` (default `http://localhost:5000/api`) and attaches the JWT automatically. Image uploads use `multipart/form-data`; returned `imageUrl` values are relative paths like `/uploads/169...jpg` — the frontend prefixes these with the API origin automatically.

## 7. AI & Maps setup

- **Gemini (required for real AI, optional otherwise):** get a free key at https://aistudio.google.com/app/apikey, put it in `GEMINI_API_KEY`. Every AI call lives in `src/services/aiService.js` with an automatic mock fallback.
- **Google Maps Geocoding (optional):** get a key at https://console.cloud.google.com/google/maps-apis, enable the "Geocoding API", put it in `GOOGLE_MAPS_API_KEY`. Without it, `src/services/geoService.js` uses a stable fallback so the app still works end-to-end — you just get a generic zone label instead of a real neighbourhood name. The same key (or a separate, more restricted one) can be given to the frontend as `VITE_GOOGLE_MAPS_API_KEY` to show an embedded map preview when a citizen files a report.
