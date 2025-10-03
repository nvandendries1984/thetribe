import { Router } from 'express';
import { createApiResponse } from '../../../shared/dist/index';

export const statsRoutes = Router();

// Get bot statistics
statsRoutes.get('/', (req, res) => {
  res.json(createApiResponse(true, {
    guilds: 5,
    users: 1250,
    commands: 15,
    uptime: '2d 14h 32m 15s',
    version: '1.0.0',
    memory: {
      used: '125MB',
      total: '512MB',
    },
    modules: {
      loaded: 3,
      available: 5,
    },
  }));
});

// Get guild statistics
statsRoutes.get('/guilds/:guildId', (req, res) => {
  const { guildId } = req.params;

  res.json(createApiResponse(true, {
    guildId,
    members: 250,
    channels: 15,
    roles: 8,
    commandsUsed: 1540,
    mostUsedCommand: 'ping',
  }));
});