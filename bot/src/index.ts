import { Client, GatewayIntentBits, Events, Collection } from 'discord.js';
import { config } from 'dotenv';
import { DatabaseManager, Logger } from '../../shared/dist/index';
import { ModuleManager } from './managers/ModuleManager';
import { CommandManager } from './managers/CommandManager';
import { EventManager } from './managers/EventManager';

config();

export class TheTribeBot {
  public client: Client;
  public database: DatabaseManager;
  public moduleManager: ModuleManager;
  public commandManager: CommandManager;
  public eventManager: EventManager;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
      ],
    });

    this.database = new DatabaseManager(
      process.env.MONGODB_URI || 'mongodb://localhost:27017',
      process.env.DB_NAME || 'thetribe'
    );

    this.moduleManager = new ModuleManager(this);
    this.commandManager = new CommandManager(this);
    this.eventManager = new EventManager(this);

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.client.once(Events.ClientReady, async (readyClient) => {
      Logger.info(`Bot is ready! Logged in as ${readyClient.user.tag}`);
      Logger.info(`Serving ${this.client.guilds.cache.size} guilds`);

      await this.database.connect();
      await this.moduleManager.loadModules();
      await this.commandManager.registerCommands();
    });

    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (interaction.isChatInputCommand()) {
        await this.commandManager.handleCommand(interaction);
      }
    });

    this.client.on(Events.GuildCreate, async (guild) => {
      Logger.info(`Joined new guild: ${guild.name} (${guild.id})`);
      await this.database.setGuildConfig({
        guildId: guild.id,
        name: guild.name,
        prefix: '!',
        modules: {},
        settings: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    this.client.on(Events.Error, (error) => {
      Logger.error('Discord client error:', error);
    });

    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  public async start(): Promise<void> {
    try {
      const token = process.env.DISCORD_TOKEN;
      if (!token) {
        throw new Error('DISCORD_TOKEN environment variable is required');
      }

      await this.client.login(token);
    } catch (error) {
      Logger.error('Failed to start bot:', error);
      process.exit(1);
    }
  }

  public async shutdown(): Promise<void> {
    Logger.info('Shutting down bot...');

    await this.moduleManager.unloadModules();
    await this.database.disconnect();
    this.client.destroy();

    Logger.info('Bot shutdown complete');
    process.exit(0);
  }
}

// Start the bot if this file is run directly
if (require.main === module) {
  const bot = new TheTribeBot();
  bot.start();
}