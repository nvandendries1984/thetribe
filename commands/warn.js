const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const UserWarning = require('../models/UserWarning');
const ModerationLog = require('../models/ModerationLog');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Give a user a warning')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to warn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the warning')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason');

        if (target.id === interaction.user.id) {
            return interaction.reply({
                content: '❌ You cannot warn yourself!',
                flags: 64
            });
        }

        if (target.bot) {
            return interaction.reply({
                content: '❌ You cannot warn a bot!',
                flags: 64
            });
        }

        try {
            // Defer reply to prevent timeout
            await interaction.deferReply();

            // Create database entries
            const warning = new UserWarning({
                guildId: interaction.guild.id,
                userId: target.id,
                moderatorId: interaction.user.id,
                reason: reason
            });

            const moderationLog = new ModerationLog({
                guildId: interaction.guild.id,
                userId: target.id,
                moderatorId: interaction.user.id,
                action: 'warn',
                reason: reason
            });

            // Execute database operations in parallel
            const [savedWarning, savedLog, totalWarnings] = await Promise.all([
                warning.save(),
                moderationLog.save(),
                UserWarning.countDocuments({
                    guildId: interaction.guild.id,
                    userId: target.id,
                    active: true
                }) + 1 // +1 for the warning we just created
            ]);

            // Try to send DM to user
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#FFFF00')
                    .setTitle('⚠️ You have received a warning')
                    .setDescription(`You have received a warning in **${interaction.guild.name}**`)
                    .addFields(
                        { name: 'Reason', value: reason, inline: false },
                        { name: 'Moderator', value: interaction.user.tag, inline: true },
                        { name: 'Total warnings', value: `${totalWarnings}`, inline: true }
                    )
                    .setTimestamp();

                await target.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.log('Could not send DM to user');
            }

            const embed = new EmbedBuilder()
                .setColor('#FFFF00')
                .setTitle('⚠️ User Warned')
                .setDescription(`**${target.tag}** has received a warning`)
                .addFields(
                    { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Total warnings', value: `${totalWarnings}`, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            await interaction.followUp({ embeds: [embed] });

        } catch (error) {
            console.error('Error warning user:', error);

            const errorReply = {
                content: '❌ An error occurred while warning the user.',
                flags: 64
            };

            if (interaction.deferred) {
                await interaction.followUp(errorReply);
            } else {
                await interaction.reply(errorReply);
            }
        }
    },
};