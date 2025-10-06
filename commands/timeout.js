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
        const reason = interaction.options.getString('reason') || 'No reason provided';

        const member = await interaction.guild.members.fetch(target.id);

        if (!member) {
            return interaction.reply({
                content: '❌ User not found in this server!',
                flags: 64
            });
        }

        if (!member.moderatable) {
            return interaction.reply({
                content: '❌ I cannot timeout this user. Check my permissions and role hierarchy.',
                flags: 64
            });
        }

        if (member.id === interaction.user.id) {
            return interaction.reply({
                content: '❌ You cannot timeout yourself!',
                flags: 64
            });
        }

        if (member.id === interaction.client.user.id) {
            return interaction.reply({
                content: '❌ I cannot timeout myself!',
                flags: 64
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
                    .setTitle('⏰ You have been timed out')
                    .setDescription(`You have been timed out in **${interaction.guild.name}**`)
                    .addFields(
                        { name: 'Duration', value: `${duration} minutes`, inline: true },
                        { name: 'Until', value: `<t:${Math.floor(timeoutUntil.getTime() / 1000)}:F>`, inline: true },
                        { name: 'Reason', value: reason, inline: false },
                        { name: 'Moderator', value: interaction.user.tag, inline: true }
                    )
                    .setTimestamp();

                await target.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.log('Could not send DM to user');
            }

            const embed = new EmbedBuilder()
                .setColor('#FF9900')
                .setTitle('⏰ User Timeout')
                .setDescription(`**${target.tag}** has been timed out`)
                .addFields(
                    { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Duration', value: `${duration} minutes`, inline: true },
                    { name: 'Until', value: `<t:${Math.floor(timeoutUntil.getTime() / 1000)}:F>`, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error timing out user:', error);
            await interaction.reply({
                content: '❌ An error occurred while timing out the user.',
                flags: 64
            });
        }
    },
};