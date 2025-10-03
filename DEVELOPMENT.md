# TheTribe Development Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- MongoDB (local or Docker)
- Discord Bot Token

### Se### Backend API (Port 5001)
- `GET /api/auth/discord` - Discord OAuth2 login
- `GET /api/auth/discord/callback` - OAuth2 callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Guilds
- `GET /api/guilds` - Get user's guilds
- `GET /api/guilds/:id` - Get guild config
- `PATCH /api/guilds/:id` - Update guild config
- `GET /api/guilds/:id/modules` - Get guild modules

### Modules
- `GET /api/modules` - Get available modules
- `GET /api/modules/:name` - Get module info

### Statistics
- `GET /api/stats` - Get bot statistics
- `GET /api/stats/guilds/:id` - Get guild statistics

### URLs
- **Frontend Dashboard:** https://thetribe.bytebees.dev:3001
- **Backend API:** https://thetribe.bytebees.dev:5001 install dependencies:**
```bash
git clone https://github.com/nvandendries1984/thetribe.git
cd thetribe
npm run install:all
```

2. **Environment configuration:**
```bash
cp .env.example .env
# Edit .env with your Discord bot token and other settings
```

3. **Start MongoDB:**
```bash
# Option 1: Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Option 2: Docker Compose (includes all services)
docker-compose up -d mongodb
```

4. **Build shared package:**
```bash
npm run build:shared
```

5. **Start development servers:**
```bash
# Start all services
npm run dev

# Or start individually:
npm run dev:bot      # Discord bot
npm run dev:backend  # API server
npm run dev:frontend # Dashboard
```

## 📁 Project Structure

```
thetribe/
├── bot/           # Discord.js bot
├── backend/       # Express.js API
├── frontend/      # Next.js dashboard
├── modules/       # Bot modules
│   └── general/   # Example module
├── shared/        # Shared utilities & types
└── package.json   # Workspace configuration
```

## 🧩 Creating Modules

1. **Create module directory:**
```bash
mkdir modules/my-module
cd modules/my-module
npm init -y
```

2. **Install dependencies:**
```bash
npm install @thetribe/shared discord.js
npm install -D typescript @types/node
```

3. **Create module structure:**
```typescript
// src/index.ts
import { Module } from '@thetribe/shared';
import { myCommand } from './commands';

const myModule: Module = {
  name: 'my-module',
  version: '1.0.0',
  description: 'My awesome module',
  config: {
    name: 'my-module',
    version: '1.0.0',
    description: 'My awesome module',
    enabled: true,
    permissions: [],
    settings: {},
  },
  commands: [myCommand],
};

export default myModule;
```

4. **Build and test:**
```bash
npm run build
cd ../.. && npm run dev:bot
```

## 🔧 Available Scripts

### Root Level
- `npm run dev` - Start all services
- `npm run build` - Build all packages
- `npm run test` - Run all tests
- `npm run lint` - Lint all packages
- `npm run clean` - Clean all node_modules

### Individual Services
- `npm run dev:bot` - Start bot in development
- `npm run dev:backend` - Start API server
- `npm run dev:frontend` - Start dashboard
- `npm run build:shared` - Build shared package

## 🗄️ Database

### Collections
- `guilds` - Guild configurations
- `users` - User data per guild
- `logs` - Bot activity logs

### Example Guild Config
```json
{
  "guildId": "123456789",
  "name": "My Server",
  "prefix": "!",
  "modules": {
    "general": true,
    "moderation": false
  },
  "settings": {},
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

## 🌐 API Endpoints

### Authentication
- `GET /api/auth/discord` - Discord OAuth2 login
- `GET /api/auth/discord/callback` - OAuth2 callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Guilds
- `GET /api/guilds` - Get user's guilds
- `GET /api/guilds/:id` - Get guild config
- `PATCH /api/guilds/:id` - Update guild config
- `GET /api/guilds/:id/modules` - Get guild modules

### Modules
- `GET /api/modules` - Get available modules
- `GET /api/modules/:name` - Get module info

### Statistics
- `GET /api/stats` - Get bot statistics
- `GET /api/stats/guilds/:id` - Get guild statistics

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch:** `git checkout -b feature/my-feature`
3. **Make changes and test**
4. **Commit:** `git commit -m "Add my feature"`
5. **Push:** `git push origin feature/my-feature`
6. **Create Pull Request**

### Code Style
- Use TypeScript for all new code
- Follow ESLint/Prettier configuration
- Add JSDoc comments for public functions
- Write tests for new features

### Module Guidelines
- Keep modules independent
- Use shared types from `@thetribe/shared`
- Include proper error handling
- Document commands and features

## 🔍 Troubleshooting

### Common Issues

**Bot won't start:**
- Check Discord token in `.env`
- Ensure MongoDB is running
- Verify bot permissions

**Modules not loading:**
- Run `npm run build` in module directory
- Check module exports
- Verify module structure

**Frontend build fails:**
- Clear `.next` folder
- Run `npm run build:shared` first
- Check TypeScript errors

### Logs
- Bot logs: `bot/logs/`
- API logs: Browser network tab
- Database logs: MongoDB logs

## 📚 Resources

- [Discord.js Guide](https://discordjs.guide/)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Manual](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)