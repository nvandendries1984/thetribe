import { Router } from 'express';
import { createApiResponse } from '../../../shared/dist/index';

export const moduleRoutes = Router();

// Get all available modules
moduleRoutes.get('/', (req, res) => {
  res.json(createApiResponse(true, [
    {
      name: 'general',
      version: '1.0.0',
      description: 'General purpose commands',
      enabled: true,
      commands: ['ping', 'serverinfo', 'userinfo'],
    },
    {
      name: 'moderation',
      version: '1.0.0',
      description: 'Moderation tools',
      enabled: false,
      commands: ['kick', 'ban', 'mute'],
    },
  ]));
});

// Get specific module information
moduleRoutes.get('/:moduleName', (req, res) => {
  const { moduleName } = req.params;

  res.json(createApiResponse(true, {
    name: moduleName,
    version: '1.0.0',
    description: `${moduleName} module`,
    enabled: true,
    settings: {},
    commands: [],
  }));
});