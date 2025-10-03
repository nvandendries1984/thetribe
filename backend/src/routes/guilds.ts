import { Router } from 'express';
import { createApiResponse } from '../../../shared/dist/index';
import { requireAuth, requireGuildAccess } from '../middleware/auth';

export const guildRoutes = Router();

// Get all guilds for the authenticated user
guildRoutes.get('/', requireAuth, (req, res) => {
  const user = (req.session as any).user;

  // Filter guilds where user has manage permissions
  const manageableGuilds = user.guilds?.filter((guild: any) =>
    guild.owner || (parseInt(guild.permissions) & 0x20) === 0x20
  ) || [];

  res.json(createApiResponse(true, manageableGuilds));
});

// Get specific guild configuration
guildRoutes.get('/:guildId', requireAuth, requireGuildAccess, (req, res) => {
  const { guildId } = req.params;

  res.json(createApiResponse(true, {
    guildId,
    name: 'Example Guild',
    prefix: '!',
    modules: {
      general: true,
      moderation: false,
    },
    settings: {},
  }));
});

// Update guild configuration
guildRoutes.patch('/:guildId', (req, res) => {
  const { guildId } = req.params;
  const updates = req.body;

  res.json(createApiResponse(true, null, 'Guild configuration updated'));
});

// Get guild modules
guildRoutes.get('/:guildId/modules', (req, res) => {
  const { guildId } = req.params;

  res.json(createApiResponse(true, {
    available: [
      { name: 'general', enabled: true, description: 'General commands' },
      { name: 'moderation', enabled: false, description: 'Moderation tools' },
    ]
  }));
});

// Toggle guild module
guildRoutes.post('/:guildId/modules/:moduleName/toggle', (req, res) => {
  const { guildId, moduleName } = req.params;

  res.json(createApiResponse(true, null, `Module ${moduleName} toggled`));
});