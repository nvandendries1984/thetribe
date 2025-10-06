const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows all available commands'),

    async execute(interaction) {
        const { commands } = interaction.client;

        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('📚 Help - Available Commands')
            .setDescription('Here are all available commands:')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp();

        // Command categories
        const generalCommands = [];
        const moderationCommands = [];
        const automodCommands = [];
        const aiCommands = [];
        const systemCommands = [];

        commands.forEach(command => {
            const commandName = `\`/${command.data.name}\``;
            const commandDesc = command.data.description || 'No description';

            // Check if command requires special permissions
            if (command.data.name.includes('ban') || command.data.name.includes('kick') ||
                command.data.name.includes('mute') || command.data.name.includes('timeout') ||
                command.data.name.includes('warn') || command.data.name.includes('clear')) {
                moderationCommands.push(`${commandName} - ${commandDesc}`);
            } else if (command.data.name.includes('automod')) {
                automodCommands.push(`${commandName} - ${commandDesc}`);
            } else if (command.data.name.includes('ai')) {
                aiCommands.push(`${commandName} - ${commandDesc}`);
            } else if (command.data.name.includes('botinfo') || command.data.name.includes('systeminfo')) {
                systemCommands.push(`${commandName} - ${commandDesc}`);
            } else {
                generalCommands.push(`${commandName} - ${commandDesc}`);
            }
        });

        if (generalCommands.length > 0) {
            embed.addFields({
                name: '🔧 General Commands',
                value: generalCommands.join('\n'),
                inline: false
            });
        }

        if (moderationCommands.length > 0) {
            embed.addFields({
                name: '🛡️ Moderation Commands',
                value: moderationCommands.join('\n'),
                inline: false
            });
        }

        if (automodCommands.length > 0) {
            embed.addFields({
                name: '🤖 AutoMod Commands',
                value: automodCommands.join('\n'),
                inline: false
            });
        }

        if (aiCommands.length > 0) {
            embed.addFields({
                name: '🧠 AI Commands',
                value: aiCommands.join('\n'),
                inline: false
            });
        }

        if (systemCommands.length > 0) {
            embed.addFields({
                name: '📊 System & Info Commands',
                value: systemCommands.join('\n'),
                inline: false
            });
        }

        embed.addFields(
            { name: '💡 AI Assistant', value: 'You can also mention me (@TheTribe) with a question to get an AI response!', inline: false },
            { name: 'ℹ️ Bot Details', value: 'Use `/botinfo` for detailed bot information or `/info bot` for basic info.', inline: false }
        );

        await interaction.reply({ embeds: [embed] });
    },
};