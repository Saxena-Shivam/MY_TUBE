# MYTUBE Security Notes

## Authentication

- Login and refresh use JWT access/refresh tokens.
- `verifyJWT` protects mutations and private data.
- `optionalJWT` enriches public reads without rejecting guests.
- Refresh retries are limited to one request in the Axios interceptor.
- Passwords are hashed with bcrypt before persistence.
- Refresh tokens are stored server-side and cookies use `httpOnly`; production enables secure cross-site cookie settings.

## Authorization

- Video deletion checks that the authenticated user owns the video.
- Tweet updates/deletes check the authenticated owner.
- Playlist mutations/deletion check playlist ownership.
- Subscription routes reject self-subscription.
- Notification reads and mutations are scoped to `req.user._id`.
- Frontend owner-only controls are presentation rules; backend authorization remains authoritative.

## Input and upload safety

- Controllers validate Mongo ObjectId parameters before queries.
- User input is trimmed or normalized where appropriate.
- Video tags are limited to 20 normalized values.
- Uploads are handled through Multer and sent to Cloudinary; local upload folders should not be publicly exposed.
- Express JSON and URL-encoded request bodies are size limited.
- CORS uses the configured origin and credentials mode.

## Data integrity

- Video deletion cleans dependent playlist, like, comment, notification, and history references where applicable.
- Null populated references are filtered before frontend rendering.
- Playlist insertion uses `$addToSet` to prevent duplicate video IDs.
- History uses upsert semantics for repeated watches.

## Operational recommendations

- Keep `.env` out of version control and rotate secrets if exposed.
- Use long random access and refresh secrets, and separate them.
- Set `CORS_ORIGIN` to the deployed frontend origin only.
- Use HTTPS in production.
- Add rate limiting and request logging at the reverse proxy/API edge before production launch.
- Validate Cloudinary file type, size, and transformation policies for production uploads.
- Review MongoDB network access and credentials; never expose the database publicly.
- Avoid logging passwords, tokens, cookies, or Cloudinary secrets.
