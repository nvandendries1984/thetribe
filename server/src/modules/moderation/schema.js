// Moderation module Mongoose schema
import { Schema } from 'mongoose';

export function registerModels(registerModel) {
  // Moderation log schema (per guild)
  const ModerationLogSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    action: { type: String, required: true },
    reason: { type: String },
    moderatorId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
  }, { timestamps: true });
  ModerationLogSchema.index({ guildId: 1, userId: 1 });
  return {
    ModerationLog: registerModel('ModerationLog', ModerationLogSchema)
  };
}
