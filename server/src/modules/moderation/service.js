// Moderation bot service: registers Discord event handlers
import { getConnection } from '../../db/index.js';

export function register(client) {
  // Example: log moderation actions
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'ban') {
      // ...ban logic...
      const ModerationLog = getConnection().model('ModerationLog');
      await ModerationLog.create({
        guildId: interaction.guildId,
        userId: interaction.options.getUser('user').id,
        action: 'ban',
        reason: interaction.options.getString('reason') || '',
        moderatorId: interaction.user.id,
      });
      await interaction.reply({ content: 'User banned and logged.', ephemeral: true });
    }
  });
}
