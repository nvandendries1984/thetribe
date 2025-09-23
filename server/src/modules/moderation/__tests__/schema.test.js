// Example unit test for moderation model validation
import mongoose from 'mongoose';
import { registerModels } from '../schema.js';

describe('ModerationLog schema', () => {
  let ModerationLog;
  beforeAll(() => {
    ModerationLog = registerModels(mongoose.model.bind(mongoose)).ModerationLog;
  });
  it('should require guildId and userId', async () => {
    const doc = new ModerationLog({ action: 'ban', moderatorId: 'mod' });
    let err;
    try {
      await doc.validate();
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(err.errors.guildId).toBeDefined();
    expect(err.errors.userId).toBeDefined();
  });
});
