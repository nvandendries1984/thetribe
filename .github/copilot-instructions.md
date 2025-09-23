# Copilot Instructions for TheTribe Discord Bot

## Project Overview
- **TheTribe** is a fully modular, multi-guild, multi-purpose Discord bot built for collaborative development.
- Key components: Discord bot (Node.js/discord.js), MongoDB for data, REST API backend (Express.js or NestJS), and a React/Next.js dashboard frontend.

## Architecture & Structure
- **Modules**: Each feature (e.g., moderation, music, logging) is a separate module/package/folder. Modules should be independently developed and tested.
- **Multi-Guild**: All server-specific settings and data are stored in MongoDB. Each guild has its own config.
- **Backend API**: Provides endpoints for dashboard and bot communication. Authentication uses Discord OAuth2.
- **Frontend Dashboard**: Allows server admins to manage modules and settings in real time.

## Developer Workflows
- **Collaboration**: All work is tracked via GitHub issues and projects. Use pull requests for all changes.
- **Module Development**: Add new modules as separate folders/packages. Avoid tight coupling between modules.
- **Testing**: Each module should include its own tests. Use standard Node.js/Express/NestJS testing tools.
- **Linting/Style**: Follow agreed code style and linting rules (see project config files if present).

## Patterns & Conventions
- **Modularity**: Design modules to be plug-and-play. Avoid global state; use dependency injection or context passing.
- **MongoDB Usage**: Store all guild/user/config data in MongoDB collections. Use clear schema definitions.
- **API Design**: REST endpoints should be versioned and documented. Prefer async/await for all I/O.
- **Frontend**: Use React/Next.js with TailwindCSS. Keep UI components atomic and reusable.

## Integration Points
- **Discord.js**: All bot commands/events are handled via discord.js. Modules register their own commands/events.
- **Backend/Frontend**: Communicate via REST API (or GraphQL if adopted). Use Discord OAuth2 for authentication.
- **External Services**: Document any third-party integrations in module README files.

## Key Files & Directories
- `README.md`: High-level project goals, tech stack, and collaboration guidelines.
- `modules/` or similar: Each module/feature lives here. Follow modular structure.
- `backend/`, `frontend/`: API and dashboard codebases.
- `config/`: Shared configuration files.

## Example: Adding a New Module
1. Create a new folder/package under `modules/`.
2. Implement Discord.js command/event handlers in that module.
3. Define MongoDB schemas for any data storage needs.
4. Add REST API endpoints if dashboard integration is needed.
5. Write tests and update documentation.

---

For questions about architecture, workflows, or conventions, review `README.md` and existing module code. If unclear, ask for feedback or clarification.
