import { Collection, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command, Logger } from '../../../shared/dist/index';
import { TheTribeBot } from '../index';

export class CommandManager {
  private commands: Collection<string, Command> = new Collection();
  private cooldowns: Collection<string, Collection<string, number>> = new Collection();

  constructor(private bot: TheTribeBot) {}

  registerCommand(command: Command): void {
    if (this.commands.has(command.name)) {
      Logger.warn(`Command ${command.name} is already registered, overwriting...`);
    }

    this.commands.set(command.name, command);
    Logger.debug(`Registered command: ${command.name}`);
  }

  unregisterCommand(commandName: string): boolean {
    if (this.commands.has(commandName)) {
      this.commands.delete(commandName);
      this.cooldowns.delete(commandName);
      Logger.debug(`Unregistered command: ${commandName}`);
      return true;
    }
    return false;
  }

  async registerCommands(): Promise<void> {
    const commandData = this.commands.map(command => {
      const slashCommand = new SlashCommandBuilder()
        .setName(command.name)
        .setDescription(command.description);

      // Add options if they exist
      if (command.options) {
        for (const option of command.options) {
          switch (option.type) {
            case 6: // USER
              slashCommand.addUserOption(opt => {
                opt.setName(option.name).setDescription(option.description);
                if (option.required) opt.setRequired(true);
                return opt;
              });
              break;
            case 3: // STRING
              slashCommand.addStringOption(opt => {
                opt.setName(option.name).setDescription(option.description);
                if (option.required) opt.setRequired(true);
                if (option.choices) {
                  opt.addChoices(...option.choices.map(c => ({ name: c.name, value: c.value as string })));
                }
                return opt;
              });
              break;
            case 4: // INTEGER
              slashCommand.addIntegerOption(opt => {
                opt.setName(option.name).setDescription(option.description);
                if (option.required) opt.setRequired(true);
                if (option.choices) {
                  opt.addChoices(...option.choices.map(c => ({ name: c.name, value: c.value as number })));
                }
                return opt;
              });
              break;
            case 5: // BOOLEAN
              slashCommand.addBooleanOption(opt => {
                opt.setName(option.name).setDescription(option.description);
                if (option.required) opt.setRequired(true);
                return opt;
              });
              break;
            case 7: // CHANNEL
              slashCommand.addChannelOption(opt => {
                opt.setName(option.name).setDescription(option.description);
                if (option.required) opt.setRequired(true);
                return opt;
              });
              break;
            case 8: // ROLE
              slashCommand.addRoleOption(opt => {
                opt.setName(option.name).setDescription(option.description);
                if (option.required) opt.setRequired(true);
                return opt;
              });
              break;
          }
        }
      }

      return slashCommand.toJSON();
    });

    try {
      if (this.bot.client.application) {
        await this.bot.client.application.commands.set(commandData);
        Logger.info(`Registered ${commandData.length} slash commands`);
      }
    } catch (error) {
      Logger.error('Failed to register slash commands:', error);
    }
  }

  async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    const command = this.commands.get(interaction.commandName);

    if (!command) {
      Logger.warn(`Command ${interaction.commandName} not found`);
      return;
    }

    // Check if command is guild-only and interaction is not in a guild
    if (command.guildOnly && !interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used in servers!',
        ephemeral: true,
      });
      return;
    }

    // Check permissions
    if (command.permissions && command.permissions.length > 0) {
      const hasPermission = command.permissions.every(permission =>
        interaction.memberPermissions?.has(permission)
      );

      if (!hasPermission) {
        await interaction.reply({
          content: 'You do not have permission to use this command!',
          ephemeral: true,
        });
        return;
      }
    }

    // Handle cooldowns
    if (command.cooldown) {
      const cooldownAmount = command.cooldown * 1000;
      const userId = interaction.user.id;

      if (!this.cooldowns.has(command.name)) {
        this.cooldowns.set(command.name, new Collection());
      }

      const now = Date.now();
      const timestamps = this.cooldowns.get(command.name)!;

      if (timestamps.has(userId)) {
        const expirationTime = timestamps.get(userId)! + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          await interaction.reply({
            content: `Please wait ${timeLeft.toFixed(1)} more seconds before using this command again.`,
            ephemeral: true,
          });
          return;
        }
      }

      timestamps.set(userId, now);
      setTimeout(() => timestamps.delete(userId), cooldownAmount);
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      Logger.error(`Error executing command ${command.name}:`, error);

      const errorMessage = 'There was an error while executing this command!';

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  }

  getCommand(name: string): Command | undefined {
    return this.commands.get(name);
  }

  getCommands(): Collection<string, Command> {
    return this.commands;
  }

  hasCommand(name: string): boolean {
    return this.commands.has(name);
  }
}