# MYTUBE Setup and File Guide

## Repository layout

- `backend/package.json`: backend dependencies and the `dev` script.
- `backend/.env`: local secrets and service configuration. Do not commit it.
- `backend/public/`: static backend files.
- `backend/src/index.js`: loads environment variables, connects MongoDB, and starts Express.
- `backend/src/app.js`: middleware registration and API route mounting.
- `backend/src/constants.js`: backend constants.
- `backend/src/db/index.js`: MongoDB connection helper.
- `backend/src/middlewares/auth.middleware.js`: JWT verification and optional authentication.
- `backend/src/middlewares/multer.middleware.js`: multipart upload handling.
- `backend/src/controllers/`: request handlers for users, videos, tweets, comments, likes, subscriptions, playlists, dashboard, notifications, and history.
- `backend/src/models/`: Mongoose schemas for users, videos, tweets, comments, likes, subscriptions, playlists, watch history, notifications, and health checks.
- `backend/src/routes/`: Express route modules mounted by `src/app.js`.
- `backend/src/utils/`: API errors/responses, async handlers, Cloudinary uploads, duration extraction, and like statistics.
- `frontend/package.json`: frontend dependencies and Vite scripts.
- `frontend/index.html`: browser entry document.
- `frontend/vite.config.ts`: Vite configuration.
- `frontend/tsconfig*.json`: TypeScript configuration.
- `frontend/src/main.tsx`: React entry point, router, theme, and toast provider.
- `frontend/src/App.tsx`: route definitions and protected/guest route guards.
- `frontend/src/api/axios.ts`: API client, auth token injection, and refresh handling.
- `frontend/src/context/`: authentication and theme state.
- `frontend/src/services/`: typed API clients for each backend feature.
- `frontend/src/types/index.ts`: shared frontend data contracts.
- `frontend/src/components/`: reusable layout, video, tweet, playlist, dialog, loader, share, and notification UI.
- `frontend/src/pages/`: route-level screens for auth, home, video, channel, history, playlists, dashboard, settings, and posts.
- `frontend/src/lib/utils.ts`: class helpers, owner helpers, duration/count formatting, and fallbacks.

## Prerequisites

- Node.js 20 or newer.
- MongoDB.
- Cloudinary account for video/image uploads.

## Environment

Create `backend/.env` with values matching the application:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017
DB_NAME=mytube
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=replace-with-a-long-random-secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=replace-with-a-different-long-random-secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Optional `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

## Install and run

```powershell
cd backend
npm install
npm run dev
```

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Validation

```powershell
cd frontend
npm run build
npm run lint
```

Backend syntax checks can be run with `node --check path/to/file.js`.

## Upload requirements

Video publishing uses multipart form data with `videoFile` and `thumbnail`. The backend extracts duration before Cloudinary upload, stores optional comma-separated tags, and can attach the new video to owner playlists using repeated `playlistIds` fields.
