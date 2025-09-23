// Leveling module schema example
import { Schema } from 'mongoose';

export function registerModels(registerModel) {
  const LevelSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    lastMessage: { type: Date },
  }, { timestamps: true });
  LevelSchema.index({ guildId: 1, userId: 1 });
  return {
    Level: registerModel('Level', LevelSchema)
  };
}
