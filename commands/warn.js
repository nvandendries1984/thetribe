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

            // Save the warning and moderation log first
            const [savedWarning, savedLog] = await Promise.all([
                warning.save(),
                moderationLog.save()
            ]);

            // Now get the correct total count including the new warning
            const totalWarnings = await UserWarning.countDocuments({
                guildId: interaction.guild.id,
                userId: target.id,
                active: true
            });

            // Try to send DM to user
            let dmSent = false;
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#FF6B35')
                    .setTitle('⚠️ Warning Received')
                    .setDescription(`You have received a warning in **${interaction.guild.name}**`)
                    .addFields(
                        { name: '📝 Reason', value: `\`\`\`${reason}\`\`\``, inline: false },
                        { name: '👮 Moderator', value: interaction.user.tag, inline: true },
                        { name: '📊 Total Warnings', value: `**${totalWarnings}** warning${totalWarnings === 1 ? '' : 's'}`, inline: true },
                        { name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                    )
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setFooter({
                        text: `Warning ID: ${savedWarning._id} • ${interaction.guild.name}`,
                        iconURL: interaction.guild.iconURL({ dynamic: true })
                    })
                    .setTimestamp();

                await target.send({ embeds: [dmEmbed] });
                dmSent = true;
            } catch (dmError) {
                console.log('Could not send DM to user:', dmError.message);
            }

            // Determine warning level and color
            let warningLevel = '🟡 Low';
            let embedColor = '#FFFF00';

            if (totalWarnings >= 5) {
                warningLevel = '🔴 Critical';
                embedColor = '#FF0000';
            } else if (totalWarnings >= 3) {
                warningLevel = '🟠 High';
                embedColor = '#FF6B35';
            } else if (totalWarnings >= 2) {
                warningLevel = '🟡 Medium';
                embedColor = '#FFA500';
            }

            const embed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle('⚠️ Warning Issued')
                .setDescription(`**${target.tag}** has been warned by **${interaction.user.tag}**`)
                .addFields(
                    {
                        name: '👤 Target User',
                        value: `${target.tag}\n\`${target.id}\``,
                        inline: true
                    },
                    {
                        name: '👮 Moderator',
                        value: `${interaction.user.tag}\n<@${interaction.user.id}>`,
                        inline: true
                    },
                    {
                        name: '📊 Warning Status',
                        value: `**${totalWarnings}** total warning${totalWarnings === 1 ? '' : 's'}\n${warningLevel}`,
                        inline: true
                    },
                    {
                        name: '📝 Reason',
                        value: `\`\`\`${reason}\`\`\``,
                        inline: false
                    },
                    {
                        name: '📩 Direct Message',
                        value: dmSent ? '✅ Successfully sent' : '❌ Could not send DM',
                        inline: true
                    },
                    {
                        name: '🆔 Warning ID',
                        value: `\`${savedWarning._id}\``,
                        inline: true
                    },
                    {
                        name: '📅 Timestamp',
                        value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                        inline: true
                    }
                )
                .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                .setFooter({
                    text: `Moderation Action • ${interaction.guild.name}`,
                    iconURL: interaction.guild.iconURL({ dynamic: true })
                })
                .setTimestamp();

            // Add suggested actions for high warning counts
            if (totalWarnings >= 3) {
                const actionEmbed = new EmbedBuilder()
                    .setColor('#FF6B35')
                    .setTitle('🚨 Moderation Alert')
                    .setDescription(`**${target.tag}** now has **${totalWarnings}** warnings. Consider taking additional action.`)
                    .addFields(
                        {
                            name: '⚡ Suggested Actions',
                            value: totalWarnings >= 5
                                ? '• Consider a temporary ban or kick\n• Review all warning history\n• Consider permanent ban for repeat offenders'
                                : '• Consider a timeout (mute)\n• Monitor user activity closely\n• Review warning patterns',
                            inline: false
                        },
                        {
                            name: '📋 Quick Commands',
                            value: `\`/timeout <@${target.id}> <duration> Follow-up action\`\n\`/warnings <@${target.id}>\` - View all warnings\n\`/kick <@${target.id}> Multiple warnings\``,
                            inline: false
                        }
                    )
                    .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: 'Moderation Assistant', iconURL: interaction.client.user.displayAvatarURL() })
                    .setTimestamp();

                await interaction.followUp({ embeds: [embed, actionEmbed] });
            } else {
                await interaction.followUp({ embeds: [embed] });
            }

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