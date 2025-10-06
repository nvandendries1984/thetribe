const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('delete-days')
                .setDescription('Number of days of messages to delete (0-7)')
                .setMinValue(0)
                .setMaxValue(7)
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const deleteDays = interaction.options.getInteger('delete-days') || 0;

        // Check if user can be banned
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (member && !member.bannable) {
            return interaction.reply({
                content: '❌ I cannot ban this user. Check my permissions and role hierarchy.',
                ephemeral: true
            });
        }

        if (target.id === interaction.user.id) {
            return interaction.reply({
                content: '❌ You cannot ban yourself!',
                ephemeral: true
            });
        }

        if (target.id === interaction.client.user.id) {
            return interaction.reply({
                content: '❌ I cannot ban myself!',
                ephemeral: true
            });
        }

        try {
            // Check if user is already banned
            const existingBan = await interaction.guild.bans.fetch(target.id).catch(() => null);
            if (existingBan) {
                return interaction.reply({
                    content: '❌ Deze gebruiker is al geband!',
                    ephemeral: true
                });
            }

            // Send DM to user before banning (only if they're in the server)
            if (member) {
                try {
                    const dmEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('🔨 Je bent geband')
                        .setDescription(`Je bent geband van **${interaction.guild.name}**`)
                        .addFields(
                            { name: 'Reden', value: reason, inline: true },
                            { name: 'Moderator', value: interaction.user.tag, inline: true }
                        )
                        .setTimestamp();

                    await target.send({ embeds: [dmEmbed] });
                } catch (dmError) {
                    console.log('Could not send DM to user');
                }
            }

            // Ban the user
            await interaction.guild.members.ban(target, {
                reason: `${reason} | Moderator: ${interaction.user.tag}`,
                deleteMessageDays: deleteDays
            });

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔨 Gebruiker Geband')
                .setDescription(`**${target.tag}** is geband van de server`)
                .addFields(
                    { name: 'Gebruiker', value: `${target.tag} (${target.id})`, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Reden', value: reason, inline: false },
                    { name: 'Berichten verwijderd', value: `${deleteDays} dagen`, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error banning user:', error);
            await interaction.reply({
                content: '❌ Er is een fout opgetreden bij het bannen van de gebruiker.',
                ephemeral: true
            });
        }
    },
};