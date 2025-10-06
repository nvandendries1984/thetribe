const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const UserWarning = require('../models/UserWarning');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('View warnings for a user')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to view warnings for')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const target = interaction.options.getUser('target') || interaction.user;

        await interaction.deferReply();

        try {
            const warnings = await UserWarning.find({
                guildId: interaction.guild.id,
                userId: target.id,
                active: true
            }).sort({ createdAt: -1 });

            if (warnings.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('✅ No Warnings')
                    .setDescription(`${target.tag} has no active warnings.`)
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setColor('#FFFF00')
                .setTitle(`⚠️ Warnings for ${target.tag}`)
                .setDescription(`Total: **${warnings.length}** active warnings`)
                .setThumbnail(target.displayAvatarURL())
                .setTimestamp();

            // Show up to 10 most recent warnings
            const recentWarnings = warnings.slice(0, 10);

            for (let i = 0; i < recentWarnings.length; i++) {
                const warning = recentWarnings[i];
                const moderator = await interaction.client.users.fetch(warning.moderatorId).catch(() => null);

                embed.addFields({
                    name: `Warning #${i + 1}`,
                    value: `**Reason:** ${warning.reason}\n**Moderator:** ${moderator ? moderator.tag : 'Unknown'}\n**Date:** <t:${Math.floor(warning.createdAt.getTime() / 1000)}:R>`,
                    inline: false
                });
            }

            if (warnings.length > 10) {
                embed.setFooter({ text: `Showing the 10 most recent warnings out of ${warnings.length} total` });
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error fetching warnings:', error);
            await interaction.editReply('❌ An error occurred while fetching warnings.');
        }
    },
};