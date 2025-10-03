import { Request, Response, NextFunction } from 'express';
import { createApiResponse } from '../../../shared/dist/index';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = (req.session as any)?.user;

  if (!user) {
    return res.status(401).json(createApiResponse(false, undefined, undefined, 'Authentication required'));
  }

  next();
}

export function requireGuildAccess(req: Request, res: Response, next: NextFunction) {
  const user = (req.session as any)?.user;
  const guildId = req.params.guildId;

  if (!user) {
    return res.status(401).json(createApiResponse(false, undefined, undefined, 'Authentication required'));
  }

  if (!guildId) {
    return res.status(400).json(createApiResponse(false, undefined, undefined, 'Guild ID required'));
  }

  // Check if user has access to this guild (is member or has manage permissions)
  const hasAccess = user.guilds?.some((guild: any) =>
    guild.id === guildId && (guild.owner || (parseInt(guild.permissions) & 0x20) === 0x20)
  );

  if (!hasAccess) {
    return res.status(403).json(createApiResponse(false, undefined, undefined, 'No permission to access this guild'));
  }

  next();
}