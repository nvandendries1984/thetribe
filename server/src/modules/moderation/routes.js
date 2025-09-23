// Express router for moderation API
import express from 'express';
import { getConnection } from '../../db/index.js';

const router = express.Router();

// Example: GET /api/moderation/logs?guildId=...&userId=...
router.get('/logs', async (req, res) => {
  const { guildId, userId } = req.query;
  if (!guildId) return res.status(400).json({ error: 'guildId required' });
  const ModerationLog = getConnection().model('ModerationLog');
  const query = { guildId };
  if (userId) query.userId = userId;
  const logs = await ModerationLog.find(query).sort({ createdAt: -1 }).limit(100);
  res.json(logs);
});

export default router;
