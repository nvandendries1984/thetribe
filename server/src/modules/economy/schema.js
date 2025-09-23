// Economy module schema example
import { Schema } from 'mongoose';

export function registerModels(registerModel) {
  const WalletSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    balance: { type: Number, default: 0 },
    lastTransaction: { type: Date },
  }, { timestamps: true });
  WalletSchema.index({ guildId: 1, userId: 1 });
  return {
    Wallet: registerModel('Wallet', WalletSchema)
  };
}
