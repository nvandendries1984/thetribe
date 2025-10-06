# Multi-Guild Discord Bot

A powerful multi-guild Discord bot with slash commands, automod functionality, and MongoDB integration.

## Features

### 🤖 General Commands
- `/ping` - Shows bot and API latency
- `/help` - Shows all available commands
- `/info` - Shows information about bot, server, or user

### 🛡️ Moderation Commands
- `/kick` - Kick a user from the server
- `/ban` - Ban a user from the server
- `/timeout` - Give a user a timeout
- `/warn` - Give a user a warning
- `/warnings` - View warnings for a user
- `/clear` - Delete messages from a channel

### 🤖 AutoMod Functionality
- `/automod create` - Create new AutoMod rules
- `/automod list` - View all AutoMod rules
- `/automod delete` - Delete an AutoMod rule
- Automatic spam detection
- Keyword filtering
- Mention spam protection

### 📊 Database Features
- MongoDB integration for logging
- Warning system
- Moderation logs
- Persistent data storage
- Multi-guild support

## Installation

### 🐳 Docker Installation (Recommended)

#### Requirements
- Docker and Docker Compose
- Discord Application with bot token

#### Quick Start with Docker

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd thetribe
   ```

2. **Environment configuration:**
   Make sure your `.env` file has the correct values:
   ```env
   DISCORD_TOKEN=your_bot_token
   DISCORD_CLIENT_ID=your_client_id
   DISCORD_CLIENT_SECRET=your_client_secret
   MONGODB_URI=mongodb://root:Pasja%402025@mongodb:27017/thetribe?authSource=admin
   DB_NAME=thetribe
   NODE_ENV=production
   ```

3. **Start with Docker (commands auto-deploy):**
   ```bash
   # Option 1: Use the startup script
   ./start-docker.sh
   
   # Option 2: Use npm scripts
   npm run docker:up
   ```
   
   **Note:** Commands are automatically deployed when the container starts, so no separate deployment step is needed!

4. **Monitor the bot:**
   ```bash
   # View logs
   npm run docker:logs
   
   # Check status
   docker-compose ps
   ```

#### Docker Management Commands

```bash
# Build the Docker image
npm run docker:build

# Start containers
npm run docker:up

# Stop containers
npm run docker:down

# Restart just the bot
npm run docker:restart

# View logs
npm run docker:logs
```

### 💻 Local Installation (Alternative)

#### Requirements
- Node.js 18.0.0 or higher
- MongoDB database
- Discord Application with bot token

#### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment configuration:**
   Update your `.env` file for local development:
   ```env
   DISCORD_TOKEN=your_bot_token
   DISCORD_CLIENT_ID=your_client_id
   DISCORD_CLIENT_SECRET=your_client_secret
   MONGODB_URI=mongodb://root:password@localhost:27017/thetribe?authSource=admin
   DB_NAME=thetribe
   NODE_ENV=development
   ```

3. **Start the bot:**
   ```bash
   # For local development, commands are auto-deployed
   npm start
   
   # Or manually deploy commands first (optional)
   npm run deploy-commands && npm start
   ```

   For development:
   ```bash
   npm run dev
   ```

## Bot Permissions

Make sure your bot has the following permissions:
- `Send Messages`
- `Use Slash Commands`
- `Manage Messages`
- `Kick Members`
- `Ban Members`
- `Moderate Members`
- `Manage Guild`
- `View Channels`
- `Read Message History`

## AutoMod Setup

The bot supports Discord's native AutoMod functionality:

1. **Spam Detection**: Automatically detects and blocks spam messages
2. **Keyword Filter**: Blocks messages with forbidden words
3. **Mention Spam**: Prevents excessive user mentions

Use `/automod create` to create new rules.

## Database Schema

### ModerationLog
- `guildId`: Server ID
- `userId`: User ID
- `moderatorId`: Moderator ID
- `action`: Action type (kick, ban, timeout, warn, unban)
- `reason`: Reason for action
- `duration`: Duration (for timeouts)
- `createdAt`: Timestamp of action

### UserWarning
- `guildId`: Server ID
- `userId`: User ID
- `moderatorId`: Moderator ID
- `reason`: Reason for warning
- `active`: Whether warning is still active
- `createdAt`: Timestamp of warning

## Scripts

### Local Development
- `npm start` - Start the bot in production mode
- `npm run dev` - Start the bot in development mode with nodemon
- `npm run deploy-commands` - Deploy slash commands to Discord

### Docker Commands
- `npm run docker:build` - Build Docker images
- `npm run docker:up` - Start containers
- `npm run docker:down` - Stop containers
- `npm run docker:logs` - View bot logs
- `npm run docker:restart` - Restart bot container

## Logging

The bot automatically logs:
- New members joining
- Members leaving the server
- AutoMod actions
- Moderation actions
- Errors and debug information

## 🐳 Docker Architecture

The Docker setup includes:

### Services
- **discord-bot**: The main bot application
- **mongodb**: MongoDB database with authentication
- **bot-network**: Internal Docker network for service communication

### Features
- **Health checks**: Automatic container health monitoring
- **Persistent data**: MongoDB data is persisted in Docker volumes
- **Automatic restarts**: Containers restart unless manually stopped
- **Logs directory**: Bot logs are mounted to `./logs` for easy access
- **Database initialization**: Automatic database setup with indexes

### File Structure
```
thetribe/
├── Dockerfile              # Bot container definition
├── docker-compose.yml      # Multi-container setup
├── start-docker.sh         # Easy startup script
├── healthcheck.js          # Container health check
├── mongo-init/             # Database initialization scripts
├── logs/                   # Container logs (mounted)
└── .dockerignore          # Docker build exclusions
```

### Environment Variables
The bot uses these environment variables in Docker:
- `DISCORD_TOKEN`: Your Discord bot token
- `DISCORD_CLIENT_ID`: Your Discord application client ID
- `DISCORD_CLIENT_SECRET`: Your Discord application client secret
- `MONGODB_URI`: MongoDB connection string (uses container name `mongodb`)
- `DB_NAME`: Database name
- `NODE_ENV`: Set to `production` for Docker

### Troubleshooting Docker

**Check container status:**
```bash
docker-compose ps
```

**View bot logs:**
```bash
docker-compose logs -f discord-bot
```

**View MongoDB logs:**
```bash
docker-compose logs -f mongodb
```

**Restart specific service:**
```bash
docker-compose restart discord-bot
```

**Rebuild after code changes:**
```bash
docker-compose build discord-bot
docker-compose up -d discord-bot
```

**Access MongoDB shell:**
```bash
docker-compose exec mongodb mongosh -u root -p Pasja@2025
```

## Support

For questions or issues, contact via Discord or create an issue in the repository.

## License

MIT License