const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Give a user a timeout')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to timeout')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration of the timeout in minutes')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(40320)) // Max 28 days
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the timeout')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'Geen reden opgegeven';

        const member = await interaction.guild.members.fetch(target.id);

        if (!member) {
            return interaction.reply({
                content: '❌ Gebruiker niet gevonden in deze server!',
                ephemeral: true
            });
        }

        if (!member.moderatable) {
            return interaction.reply({
                content: '❌ Ik kan deze gebruiker geen timeout geven. Controleer mijn permissies en rol hiërarchie.',
                ephemeral: true
            });
        }

        if (member.id === interaction.user.id) {
            return interaction.reply({
                content: '❌ Je kunt jezelf geen timeout geven!',
                ephemeral: true
            });
        }

        if (member.id === interaction.client.user.id) {
            return interaction.reply({
                content: '❌ Ik kan mezelf geen timeout geven!',
                ephemeral: true
            });
        }

        try {
            const timeoutDuration = duration * 60 * 1000; // Convert minutes to milliseconds
            const timeoutUntil = new Date(Date.now() + timeoutDuration);

            await member.timeout(timeoutDuration, reason);

            // Try to send DM
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#FF9900')
                    .setTitle('⏰ Je hebt een timeout gekregen')
                    .setDescription(`Je hebt een timeout gekregen in **${interaction.guild.name}**`)
                    .addFields(
                        { name: 'Duur', value: `${duration} minuten`, inline: true },
                        { name: 'Tot', value: `<t:${Math.floor(timeoutUntil.getTime() / 1000)}:F>`, inline: true },
                        { name: 'Reden', value: reason, inline: false },
                        { name: 'Moderator', value: interaction.user.tag, inline: true }
                    )
                    .setTimestamp();

                await target.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.log('Could not send DM to user');
            }

            const embed = new EmbedBuilder()
                .setColor('#FF9900')
                .setTitle('⏰ Gebruiker Timeout')
                .setDescription(`**${target.tag}** heeft een timeout gekregen`)
                .addFields(
                    { name: 'Gebruiker', value: `${target.tag} (${target.id})`, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Duur', value: `${duration} minuten`, inline: true },
                    { name: 'Tot', value: `<t:${Math.floor(timeoutUntil.getTime() / 1000)}:F>`, inline: true },
                    { name: 'Reden', value: reason, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error timing out user:', error);
            await interaction.reply({
                content: '❌ Er is een fout opgetreden bij het geven van een timeout aan de gebruiker.',
                ephemeral: true
            });
        }
    },
};