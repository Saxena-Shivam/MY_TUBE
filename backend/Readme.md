# MYTUBE Backend

The backend is an Express and MongoDB API. Start it from this directory with:

```powershell
npm install
npm run dev
```

The backend file map, environment setup, and frontend guide are documented in the repository root at `docs/SETUP.md`. The complete route collection is `docs/API_ROUTES.postman_collection.json`; database relationships and request flow are in `docs/ARCHITECTURE.md`; security practices are in `docs/SECURITY.md`.

## Source map

- `src/index.js`: environment loading, database connection, and server startup.
- `src/app.js`: Express middleware and router mounting.
- `src/constants.js`: constants.
- `src/db/index.js`: MongoDB connection.
- `src/routes/`: healthcheck, users, videos, tweets, comments, likes, subscriptions, playlists, dashboard, history, and notifications routes.
- `src/controllers/`: request validation, authorization, persistence, cleanup, and API responses for each route family.
- `src/models/`: User, Video, Tweet, Comment, Like, Subscription, Playlist, WatchHistory, Notification, and Healthcheck schemas.
- `src/middlewares/auth.middleware.js`: JWT verification and optional JWT handling.
- `src/middlewares/multer.middleware.js`: multipart upload handling.
- `src/utils/`: API errors/responses, async handlers, Cloudinary integration, duration extraction, and reaction statistics.
