# The Tribe

A multipurpose Discord bot with a modern dashboard and modular features.

## Monorepo Structure

- `packages/bot` — Discord bot (Node.js, discord.js)
- `packages/backend` — Backend API (Node.js/Express, MongoDB/PostgreSQL)
- `packages/frontend` — Dashboard (React/Next.js)

## Features
- Modular command/event system
- Multi-guild support with per-guild settings
- Dashboard for configuration (Discord OAuth2)
- Modules: Moderation, Music, Leveling, Economy, Logging, Custom Commands

## Setup

## Security & Public Repository
- **Never commit your `.env` files or secrets.**
- All sensitive configuration is excluded via `.gitignore`.

## License
MIT — see [LICENSE](./LICENSE)

See each package for setup instructions.

## Development
- ESLint + Prettier
- dotenv for configuration
- GitHub Actions for CI
