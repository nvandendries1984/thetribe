You are GitHub Copilot. Generate a complete, well-structured MERN-stack project scaffold named "TheTribe" — a multiguild, multipurpose Discord bot + management frontend. Produce code and files that are ready to run locally (with example credentials) and easy to extend. Follow all requirements below strictly.

Project goals & constraints:
1. Architecture
   - Monorepo layout:
     /server        -> Express + Discord bot + API + migrations
     /client        -> React management UI (Vite or CRA)
     /shared        -> shared types/util (optional)
     /docker        -> docker-compose for local dev (mongo + server + client)
   - Use ES modules (or keep CommonJS consistent across project) — choose one and be consistent.
2. Backend tech
   - Node.js (latest LTS), Express 4/5, Discord.js (v14+), Mongoose for MongoDB.
   - Environment variables from `.env` (use dotenv). **Do not hardcode credentials**.
   - Example `.env` (do not commit to git):
     ```
     NODE_ENV=development
     PORT=3000
     DB_HOST=localhost
     DB_USER=root
     DB_PASS=Pasja@2025
     DB_NAME=thetribe
     DB_AUTH=admin
     JWT_SECRET=replace_me_securely
     DISCORD_TOKEN=replace_with_real_token
     OAUTH_CLIENT_ID=replace
     OAUTH_CLIENT_SECRET=replace
     OAUTH_REDIRECT_URI=http://localhost:3000/auth/discord/callback
     ```
   - Provide a `config/example.env` with these example values.
3. Shared DB service
   - Create `/server/src/db/index.js` exporting:
     - `connectDB()` to connect using env vars (compose the connection URI with auth when provided).
     - `getConnection()` to return the mongoose connection.
     - `registerModel(name, schema)` helper for modules to register and fetch models without repeating connection logic.
   - Use Mongoose connection options safe for modern servers (useUnifiedTopology, etc).
4. Modular system and conventions
   - Each module in `/server/src/modules/<moduleName>/` with:
     - `schema.js` (or `models.js`) — declares Mongoose schemas and exports `registerModels(registerModel)` or exports models.
     - `controller.js` — business logic.
     - `routes.js` — Express router for API endpoints under `/api/<moduleName>/...`.
     - `service.js` (optional) — bot-related logic (Discord interactions).
     - `index.js` — module initializer that registers routes and models.
   - Modules to include as examples: `moderation`, `leveling`, `economy`.
   - Multi-guild support: schemas include `guildId` field and indexes for `{ guildId, userId }` as needed.
5. Migrations / versioned schema updates
   - Implement a simple migration runner:
     - Folder: `/server/migrations/` with files named `V001_initial.js`, `V002_add_indexes.js`, etc.
     - Each migration exports `up(db)` and `down(db)` async functions.
     - On server start (or via `npm run migrate`), a migration runner reads files in order and applies missing ones, tracking applied migrations in a `migrations` collection with `{name, appliedAt, checksum?}`.
     - Provide an example migration that creates moderation collection index and seeds a default guild config.
6. Discord bot integration
   - Use discord.js to instantiate a single bot client.
   - When the bot starts, it loads modules/services that register event handlers (messageCreate, interactionCreate, guildCreate).
   - Provide example moderation event handler and command registration for slash commands.
   - Bot must be able to read/update DB models via the shared DB service.
7. API & Auth
   - REST API under `/api/*`. Use JWT for admin endpoints.
   - Add Discord OAuth2 login flow to link server admins (for guild linking).
   - Admin users and roles: create `users` and `roles` models; reference them in module permission checks.
8. Frontend (management UI)
   - React app (Vite recommended) in `/client`.
   - Use React Router for pages: Dashboard, Guild Settings, Moderation Logs, Economy, Leveling, Bot Commands, Logs, Users.
   - State: use React Context or Redux; preference: Context + useReducer for clarity unless project grows.
   - Realtime: integrate socket.io client to show live logs and bot presence.
   - API calls read base URL from `.env` (REACT_APP_API_URL).
   - Provide sample components: `GuildSelector`, `ModerationTable`, `UserProfile`, `MigrationRunner` page.
   - Provide a theme/UX baseline and responsive layout. Use Tailwind CSS (optional) or plain CSS modules.
9. Dev ergonomics
   - package.json scripts for server, client, migrate, lint, format, test.
   - Docker Compose for local dev with MongoDB. Provide example `docker-compose.yml`.
   - ESLint + Prettier config.
   - README with setup steps (install, fill `.env`, `npm run migrate`, `npm run dev`).
10. Security & best practices
   - Never log secrets.
   - Validate and sanitize inputs.
   - Rate-limit sensitive endpoints.
   - Advice to rotate DB and Discord tokens; use secrets manager in production.
11. Testing & CI (minimal)
   - Provide example unit test for one module (e.g., moderation model validation).
   - Provide basic GitHub Actions workflow for lint + test.
12. Output required from you (Copilot)
   - Project folder structure.
   - Implementation for: `/server/src/db/index.js` (shared DB service), `/server/src/modules/moderation/schema.js`, `/server/src/modules/moderation/routes.js`, `/server/migrations/V001_initial.js`, `/server/src/bot/index.js` (initial bot loader), `/client/src/App.jsx` (router + auth), example React component `/client/src/pages/Moderation.jsx`.
   - `docker-compose.yml`, `package.json` for server and client, and `README.md`.
   - Example `.env` file (example values only).
   - Inline comments explaining how modules should register their schemas and migrations.
Make code well-documented and idiomatic. Use async/await. Make the migration runner idempotent. Ensure the DB connection composes credentials safely and falls back to a `mongodb://` non-auth URI when auth fields are empty.

Now scaffold the entire project per above and include the key files listed.
