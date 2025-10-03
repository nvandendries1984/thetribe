import { ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../../shared/dist/index';

export const pingCommand: Command = {
  name: 'ping',
  description: 'Replies with Pong! and shows bot latency',
  cooldown: 5,
  async execute(interaction: ChatInputCommandInteraction) {
    const sent = await interaction.reply({
      content: 'Pinging...',
      fetchReply: true
    });

    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    await interaction.editReply(
      `🏓 Pong!\n` +
      `📡 Latency: ${latency}ms\n` +
      `💓 API Latency: ${apiLatency}ms`
    );
  },
};

export const serverInfoCommand: Command = {
  name: 'serverinfo',
  description: 'Shows information about the current server',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild!;

    const embed = {
      title: `📊 ${guild.name} Server Information`,
      ...(guild.iconURL() && { thumbnail: { url: guild.iconURL()! } }),
      fields: [
        {
          name: '👑 Owner',
          value: `<@${guild.ownerId}>`,
          inline: true,
        },
        {
          name: '📅 Created',
          value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
          inline: true,
        },
        {
          name: '👥 Members',
          value: guild.memberCount.toString(),
          inline: true,
        },
        {
          name: '💬 Channels',
          value: guild.channels.cache.size.toString(),
          inline: true,
        },
        {
          name: '😀 Emojis',
          value: guild.emojis.cache.size.toString(),
          inline: true,
        },
        {
          name: '🆔 Server ID',
          value: guild.id,
          inline: true,
        },
      ],
      color: 0x7289da,
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({ embeds: [embed] });
  },
};

export const userInfoCommand: Command = {
  name: 'userinfo',
  description: 'Shows information about a user',
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild?.members.cache.get(user.id);

    const embed = {
      title: `👤 ${user.tag} User Information`,
      thumbnail: { url: user.displayAvatarURL() },
      fields: [
        {
          name: '🆔 ID',
          value: user.id,
          inline: true,
        },
        {
          name: '📅 Account Created',
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
          inline: true,
        },
      ],
      color: 0x7289da,
      timestamp: new Date().toISOString(),
    };

    if (member) {
      embed.fields.push(
        {
          name: '📅 Joined Server',
          value: member.joinedTimestamp
            ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`
            : 'Unknown',
          inline: true,
        },
        {
          name: '🎭 Roles',
          value: member.roles.cache
            .filter(role => role.name !== '@everyone')
            .map(role => `<@&${role.id}>`)
            .join(', ') || 'None',
          inline: false,
        }
      );
    }

    await interaction.reply({ embeds: [embed] });
  },
};