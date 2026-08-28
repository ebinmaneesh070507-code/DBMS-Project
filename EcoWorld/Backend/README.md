# EcoMind Express Server

Basic Node.js + Express backend starter for the EcoMind smart waste-management project.

## 1. Requirements

- Node.js 18+ recommended
- npm

## 2. Install

```bash
npm install
```

## 3. Environment

Copy `.env.example` to `.env`.

```bash
PORT=5000
NODE_ENV=development
```

## 4. Run

Development:

```bash
npm run dev
```

Normal:

```bash
npm start
```

Server:

http://localhost:5000

## 5. Test endpoints

Health:

GET `/api/health`

All waste:

GET `/api/waste`

One record:

GET `/api/waste/1`

Create record:

POST `/api/waste`

JSON body:

```json
{
  "item": "Old mobile phone",
  "category": "E-Waste",
  "quantityKg": 0.2,
  "zone": "Zone A",
  "source": "AI Scanner",
  "confidence": 0.97
}
```

Delete:

DELETE `/api/waste/1`

## Current architecture

Frontend
   ↓
Express REST API
   ↓
Temporary in-memory data

The next step should be replacing the in-memory array with MySQL and adding tables for users, zones, bins, pickups, vehicles, workers, recycling facilities, AI scans and collection records.

## Planned AI integration

A future endpoint can accept an image and/or text description:

POST `/api/ai/classify`

The Express server can forward the request to a Python ML service, receive:

- category
- confidence
- disposal recommendation

and save the result in the DB.

For the one-week prototype, keep the Express API separate from the ML service so each part is easier to debug.
