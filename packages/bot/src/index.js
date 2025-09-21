
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import loadCommands from './utils/loadCommands.js';
import loadEvents from './utils/loadEvents.js';
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.commands = new Collection();

// Connect to MongoDB for multi-guild settings
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


// Load commands and events (async)
(async () => {
  await loadCommands(client);
  await loadEvents(client);
})();

client.login(process.env.DISCORD_TOKEN);
