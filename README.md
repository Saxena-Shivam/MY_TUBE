# MYTUBE

MYTUBE is a full-stack video and creator platform with video uploads, Cloudinary media, playlists, history, reactions, subscriptions, posts, comments, notifications, channel search, and external news.

## Documentation

- [Setup and complete file map](docs/SETUP.md)
- [API route collection](docs/API_ROUTES.postman_collection.json)
- [Architecture and schema interconnections](docs/ARCHITECTURE.md)
- [Security notes](docs/SECURITY.md)

## Main directories

- `backend/`: Express, MongoDB, Mongoose, JWT, Multer, Cloudinary, controllers, models, routes, and utilities.
- `frontend/`: React, TypeScript, Vite, React Router, Framer Motion, Sonner, services, contexts, components, and pages.
- `docs/`: setup, API collection, architecture, and security documentation.

## Feature ownership

- Authentication: `frontend/src/pages/auth`, `frontend/src/context/AuthContext.tsx`, and `backend/src/controllers/user.controller.js`.
- Video and playback: `frontend/src/pages/video`, `frontend/src/components/video`, and `backend/src/controllers/video.controller.js`.
- Social content: tweet/comment pages and components with matching backend controllers.
- User state: services under `frontend/src/services` and matching backend route/controller modules.

Use [docs/SETUP.md](docs/SETUP.md) for prerequisites, environment variables, install commands, validation commands, and the complete source file map.
