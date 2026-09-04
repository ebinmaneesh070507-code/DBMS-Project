# EcoMind Backend

Express + MongoDB REST API for the EcoMind smart waste management frontend.

## Folder structure

```
ecomind-backend/
├── server.js                 # entry point
├── src/
│   ├── app.js                 # express app, middleware, route mounting
│   ├── config/db.js           # mongoose connection
│   ├── models/                # Mongoose schemas
│   ├── controllers/           # route handler logic
│   ├── routes/                # express routers, one per feature
│   ├── middleware/             # auth, upload, error handling
│   ├── services/aiService.js  # ALL AI calls live here (Gemini + mock fallback)
│   └── utils/                 # asyncHandler, ApiError, seed script
├── uploads/                    # uploaded images (served at /uploads/*)
├── .env.example
└── package.json
```

## 1. Install & run

```bash
cd ecomind-backend
npm install
cp .env.example .env       # then fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY
npm run seed                # optional: populate bins/vehicles/zones with mock data
npm run dev                  # starts on http://localhost:5000
```

Health check: `GET http://localhost:5000/api/health`

## 2. API reference (maps 1:1 to your frontend pages)

| Frontend page | Endpoints |
|---|---|
| AI Waste Scanner | `POST /api/scanner/analyze` (multipart `image`), `GET /api/scanner/history`, `GET /api/scanner/categories` |
| Waste Reporting | `POST /api/reports`, `GET /api/reports`, `GET /api/reports/:id`, `PATCH /api/reports/:id/status` |
| Smart Dashboard | `GET /api/dashboard/stats`, `GET /api/dashboard/charts`, `GET /api/dashboard/insights` |
| Smart Bin Monitoring | `GET /api/bins`, `GET /api/bins/:id`, `POST /api/bins`, `PATCH /api/bins/:id`, `DELETE /api/bins/:id` |
| Waste Prediction | `GET /api/predictions` |
| Smart Collection | `GET/POST /api/collection/vehicles`, `GET/PATCH/DELETE /api/collection/vehicles/:id` |
| Illegal Dumping Reports | `POST /api/dumping-reports` (multipart `image`), `GET /api/dumping-reports`, `PATCH /api/dumping-reports/:id/status` |
| AI Database Assistant | `POST /api/assistant/ask` `{ "question": "..." }` |
| Auth (for admin dashboard) | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |

All list endpoints return `{ success, count, data }`. All errors return `{ success: false, message }`.

## 3. Connecting the frontend

In your `services/api.js`, point `baseURL` at `http://localhost:5000/api` (or your deployed URL). Image uploads use `multipart/form-data` with field name `image`; returned `imageUrl` values are relative paths like `/uploads/169...jpg` — prefix them with your backend origin to render `<img>` tags.

## 4. AI setup

See the "AI setup" section shared alongside this project, or `src/services/aiService.js` — every AI call is centralized there with an automatic mock fallback if no key is configured.
