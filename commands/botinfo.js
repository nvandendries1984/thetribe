const { SlashCommandBuilder, EmbedBuilder, version: djsVersion } = require('discord.js');
const mongoose = require('mongoose');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Shows detailed information about the bot')
        .setDefaultMemberPermissions(),

    async execute(interaction) {
        const client = interaction.client;

        // Calculate memory usage
        const memoryUsage = process.memoryUsage();
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;

        // Calculate uptime
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        // Calculate bot's Discord uptime
        const botUptime = client.uptime;
        const botDays = Math.floor(botUptime / (1000 * 60 * 60 * 24));
        const botHours = Math.floor((botUptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const botMinutes = Math.floor((botUptime % (1000 * 60 * 60)) / (1000 * 60));

        // Get guild and user counts
        const totalGuilds = client.guilds.cache.size;
        const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const totalChannels = client.channels.cache.size;

        // Get command count
        const totalCommands = client.commands.size;

        // MongoDB status
        const mongoStatus = mongoose.connection.readyState;
        const mongoStatusText = {
            0: '❌ Disconnected',
            1: '✅ Connected',
            2: '🔄 Connecting',
            3: '❌ Disconnecting'
        }[mongoStatus] || '❓ Unknown';

        // Get ping
        const ping = client.ws.ping;

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🤖 Detailed Bot Information')
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                {
                    name: '📊 Bot Statistics',
                    value: [
                        `**Name:** ${client.user.tag}`,
                        `**ID:** ${client.user.id}`,
                        `**Created:** <t:${Math.floor(client.user.createdTimestamp / 1000)}:F>`,
                        `**Servers:** ${totalGuilds.toLocaleString()}`,
                        `**Users:** ${totalUsers.toLocaleString()}`,
                        `**Channels:** ${totalChannels.toLocaleString()}`,
                        `**Commands:** ${totalCommands}`
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '🌐 Connection Info',
                    value: [
                        `**WebSocket Ping:** ${ping >= 0 ? `${ping}ms` : 'Calculating...'}`,
                        `**Discord.js Version:** v${djsVersion}`,
                        `**Node.js Version:** ${process.version}`,
                        `**Database:** ${mongoStatusText}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '⏱️ Uptime',
                    value: [
                        `**Process:** ${days}d ${hours}h ${minutes}m ${seconds}s`,
                        `**Discord:** ${botDays}d ${botHours}h ${botMinutes}m`,
                        `**Started:** <t:${Math.floor((Date.now() - botUptime) / 1000)}:R>`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '💾 System Resources',
                    value: [
                        `**Memory Usage:** ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
                        `**Memory Limit:** ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
                        `**System Memory:** ${((usedMemory / totalMemory) * 100).toFixed(1)}% used`,
                        `**Platform:** ${os.platform()} ${os.arch()}`,
                        `**CPU Cores:** ${os.cpus().length}`
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '🔧 Environment',
                    value: [
                        `**Node ENV:** ${process.env.NODE_ENV || 'development'}`,
                        `**Process ID:** ${process.pid}`,
                        `**Docker:** ${process.env.DOCKER ? '✅ Yes' : '❌ No'}`,
                        `**Health Server:** Port ${process.env.HEALTH_PORT || '15015'}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '📈 Performance',
                    value: [
                        `**Commands Loaded:** ${client.commands.size}`,
                        `**Events Loaded:** Active listeners`,
                        `**Cache Size:** ${client.users.cache.size} users`,
                        `**Shards:** ${client.shard ? client.shard.count : 1}`
                    ].join('\n'),
                    inline: true
                }
            )
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};