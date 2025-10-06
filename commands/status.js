const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Shows a quick status overview of the bot'),

    async execute(interaction) {
        const client = interaction.client;

        // Get basic stats
        const uptime = client.uptime;
        const ping = client.ws.ping;
        const guilds = client.guilds.cache.size;
        const users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const commands = client.commands.size;

        // MongoDB status
        const mongoStatus = mongoose.connection.readyState === 1 ? '🟢 Online' : '🔴 Offline';

        // Calculate uptime
        const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));

        // Determine status color based on ping
        let statusColor = '#00FF00'; // Green
        if (ping > 200) statusColor = '#FFFF00'; // Yellow
        if (ping > 500) statusColor = '#FF0000'; // Red

        const embed = new EmbedBuilder()
            .setColor(statusColor)
            .setTitle('⚡ Bot Status')
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                {
                    name: '🏓 Connection',
                    value: `**Ping:** ${ping >= 0 ? `${ping}ms` : 'Calculating...'}`,
                    inline: true
                },
                {
                    name: '⏱️ Uptime',
                    value: `**Online:** ${days}d ${hours}h ${minutes}m`,
                    inline: true
                },
                {
                    name: '🗄️ Database',
                    value: `**Status:** ${mongoStatus}`,
                    inline: true
                },
                {
                    name: '📊 Statistics',
                    value: [
                        `**Servers:** ${guilds.toLocaleString()}`,
                        `**Users:** ${users.toLocaleString()}`,
                        `**Commands:** ${commands}`
                    ].join('\n'),
                    inline: false
                }
            )
            .setFooter({
                text: `${client.user.username} • Ready and operational`,
                iconURL: client.user.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};