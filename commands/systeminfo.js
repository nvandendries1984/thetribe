const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const mongoose = require('mongoose');
const os = require('os');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('systeminfo')
        .setDescription('Shows detailed system and technical information')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: 64 }); // Ephemeral response for admins only

        const client = interaction.client;

        try {
            // Get package.json info
            const packagePath = path.join(__dirname, '..', 'package.json');
            const packageInfo = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

            // System information
            const systemInfo = {
                platform: os.platform(),
                arch: os.arch(),
                hostname: os.hostname(),
                release: os.release(),
                cpus: os.cpus().length,
                totalMem: os.totalmem(),
                freeMem: os.freemem(),
                uptime: os.uptime()
            };

            // Process information
            const processInfo = process.memoryUsage();
            const processUptime = process.uptime();

            // MongoDB information
            const mongoInfo = {
                status: mongoose.connection.readyState,
                host: mongoose.connection.host,
                port: mongoose.connection.port,
                name: mongoose.connection.name
            };

            // Environment variables (safe ones only)
            const envInfo = {
                nodeEnv: process.env.NODE_ENV || 'development',
                port: process.env.PORT || 'Not set',
                healthPort: process.env.HEALTH_PORT || '15015',
                hasDiscordToken: !!process.env.DISCORD_TOKEN,
                hasMongoUri: !!process.env.MONGODB_URI,
                hasOpenAIKey: !!process.env.OPENAI_API_KEY
            };

            // Calculate percentages
            const memoryUsagePercent = ((processInfo.heapUsed / processInfo.heapTotal) * 100).toFixed(2);
            const systemMemoryPercent = (((systemInfo.totalMem - systemInfo.freeMem) / systemInfo.totalMem) * 100).toFixed(2);

            const embed = new EmbedBuilder()
                .setColor('#FF6600')
                .setTitle('🔧 System Information')
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    {
                        name: '📦 Application Info',
                        value: [
                            `**Name:** ${packageInfo.name}`,
                            `**Version:** ${packageInfo.version}`,
                            `**Description:** ${packageInfo.description}`,
                            `**Author:** ${packageInfo.author}`,
                            `**License:** ${packageInfo.license}`
                        ].join('\n'),
                        inline: false
                    },
                    {
                        name: '🖥️ System Specs',
                        value: [
                            `**OS:** ${systemInfo.platform} ${systemInfo.arch}`,
                            `**Hostname:** ${systemInfo.hostname}`,
                            `**Release:** ${systemInfo.release}`,
                            `**CPU Cores:** ${systemInfo.cpus}`,
                            `**System Uptime:** ${Math.floor(systemInfo.uptime / 3600)}h ${Math.floor((systemInfo.uptime % 3600) / 60)}m`
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: '💾 Memory Details',
                        value: [
                            `**Heap Used:** ${(processInfo.heapUsed / 1024 / 1024).toFixed(2)}MB (${memoryUsagePercent}%)`,
                            `**Heap Total:** ${(processInfo.heapTotal / 1024 / 1024).toFixed(2)}MB`,
                            `**RSS:** ${(processInfo.rss / 1024 / 1024).toFixed(2)}MB`,
                            `**System:** ${(systemInfo.totalMem / 1024 / 1024 / 1024).toFixed(2)}GB total`,
                            `**System Used:** ${systemMemoryPercent}%`
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: '🗄️ Database Status',
                        value: [
                            `**Status:** ${mongoInfo.status === 1 ? '✅ Connected' : '❌ Disconnected'}`,
                            `**Host:** ${mongoInfo.host || 'N/A'}`,
                            `**Port:** ${mongoInfo.port || 'N/A'}`,
                            `**Database:** ${mongoInfo.name || 'N/A'}`,
                            `**Ready State:** ${mongoInfo.status}`
                        ].join('\n'),
                        inline: false
                    },
                    {
                        name: '🔐 Environment Status',
                        value: [
                            `**Node ENV:** ${envInfo.nodeEnv}`,
                            `**Process ID:** ${process.pid}`,
                            `**Discord Token:** ${envInfo.hasDiscordToken ? '✅ Set' : '❌ Missing'}`,
                            `**MongoDB URI:** ${envInfo.hasMongoUri ? '✅ Set' : '❌ Missing'}`,
                            `**OpenAI Key:** ${envInfo.hasOpenAIKey ? '✅ Set' : '❌ Missing'}`
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: '📊 Process Stats',
                        value: [
                            `**Process Uptime:** ${Math.floor(processUptime / 3600)}h ${Math.floor((processUptime % 3600) / 60)}m`,
                            `**Node.js Version:** ${process.version}`,
                            `**Process Title:** ${process.title}`,
                            `**Working Directory:** ${process.cwd().split('/').pop()}`,
                            `**Arguments:** ${process.argv.length}`
                        ].join('\n'),
                        inline: true
                    }
                )
                .setFooter({
                    text: `System check by ${interaction.user.tag} • Admin only`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp();

            await interaction.followUp({ embeds: [embed] });

        } catch (error) {
            console.error('Error getting system info:', error);
            await interaction.followUp({
                content: '❌ An error occurred while gathering system information.',
                flags: 64
            });
        }
    },
};