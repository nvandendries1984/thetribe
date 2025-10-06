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
                    .setTitle('✅ Clean Record')
                    .setDescription(`**${target.tag}** has no active warnings.\n\n🎉 This user has maintained good behavior!`)
                    .addFields(
                        { name: '👤 User', value: `${target.tag}\n\`${target.id}\``, inline: true },
                        { name: '📊 Status', value: '🟢 **Good Standing**\n0 warnings', inline: true },
                        { name: '🔍 Checked By', value: `${interaction.user.tag}`, inline: true }
                    )
                    .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                    .setFooter({
                        text: `Warning Check • ${interaction.guild.name}`,
                        iconURL: interaction.guild.iconURL({ dynamic: true })
                    })
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            }

            // Determine warning level and color
            let warningLevel = '🟡 Low Risk';
            let embedColor = '#FFFF00';
            let statusIcon = '🟡';

            if (warnings.length >= 5) {
                warningLevel = '🔴 High Risk';
                embedColor = '#FF0000';
                statusIcon = '🔴';
            } else if (warnings.length >= 3) {
                warningLevel = '🟠 Medium Risk';
                embedColor = '#FF6B35';
                statusIcon = '🟠';
            } else if (warnings.length >= 2) {
                warningLevel = '🟡 Low-Medium Risk';
                embedColor = '#FFA500';
                statusIcon = '🟡';
            } else {
                warningLevel = '🟢 Minimal Risk';
                embedColor = '#FFFF00';
                statusIcon = '🟢';
            }

            const embed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle(`⚠️ Warning History: ${target.tag}`)
                .setDescription(`${statusIcon} **${warnings.length}** active warning${warnings.length === 1 ? '' : 's'} • **${warningLevel}**`)
                .addFields(
                    { name: '👤 User', value: `${target.tag}\n\`${target.id}\``, inline: true },
                    { name: '📊 Risk Level', value: `${statusIcon} ${warningLevel}`, inline: true },
                    { name: '🔍 Checked By', value: `${interaction.user.tag}`, inline: true }
                )
                .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            // Show up to 10 most recent warnings
            const recentWarnings = warnings.slice(0, 10);

            for (let i = 0; i < recentWarnings.length; i++) {
                const warning = recentWarnings[i];
                const moderator = await interaction.client.users.fetch(warning.moderatorId).catch(() => null);
                const warningDate = Math.floor(warning.createdAt.getTime() / 1000);

                embed.addFields({
                    name: `${statusIcon} Warning #${warnings.length - i}`,
                    value: [
                        `**📝 Reason:** \`${warning.reason}\``,
                        `**👮 Moderator:** ${moderator ? moderator.tag : 'Unknown User'}`,
                        `**📅 Date:** <t:${warningDate}:F> (<t:${warningDate}:R>)`,
                        `**🆔 ID:** \`${warning._id}\``
                    ].join('\n'),
                    inline: false
                });
            }

            if (warnings.length > 10) {
                embed.addFields({
                    name: '📄 Note',
                    value: `Showing the **10 most recent** warnings out of **${warnings.length} total** warnings.`,
                    inline: false
                });
            }

            // Add action suggestions for high warning counts
            if (warnings.length >= 3) {
                embed.addFields({
                    name: '⚡ Recommended Actions',
                    value: warnings.length >= 5
                        ? '• Consider temporary ban or kick\n• Review user behavior pattern\n• Monitor future activity closely'
                        : '• Consider timeout/mute\n• Issue final warning\n• Monitor user activity',
                    inline: false
                });
            }

            embed.setFooter({
                text: `Warning History • ${interaction.guild.name} • Page 1/${Math.ceil(warnings.length / 10)}`,
                iconURL: interaction.guild.iconURL({ dynamic: true })
            });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error fetching warnings:', error);
            await interaction.editReply('❌ An error occurred while fetching warnings.');
        }
    },
};