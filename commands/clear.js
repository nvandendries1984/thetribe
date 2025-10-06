const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Delete a number of messages from the channel')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Only delete messages from this user')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const target = interaction.options.getUser('target');

        await interaction.deferReply({ flags: 64 });

        try {
            const messages = await interaction.channel.messages.fetch({ limit: amount });

            let messagesToDelete = messages;
            if (target) {
                messagesToDelete = messages.filter(msg => msg.author.id === target.id);
            }

            if (messagesToDelete.size === 0) {
                return interaction.editReply('❌ No messages found to delete.');
            }

            // Discord doesn't allow bulk delete of messages older than 14 days
            const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
            const recentMessages = messagesToDelete.filter(msg => msg.createdTimestamp > twoWeeksAgo);
            const oldMessages = messagesToDelete.filter(msg => msg.createdTimestamp <= twoWeeksAgo);

            let deletedCount = 0;

            // Bulk delete recent messages
            if (recentMessages.size > 0) {
                await interaction.channel.bulkDelete(recentMessages, true);
                deletedCount += recentMessages.size;
            }

            // Delete old messages one by one
            if (oldMessages.size > 0) {
                for (const message of oldMessages.values()) {
                    try {
                        await message.delete();
                        deletedCount++;
                    } catch (error) {
                        console.log('Could not delete old message:', error);
                    }
                }
            }

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🧹 Messages Deleted')
                .setDescription(`**${deletedCount}** messages have been deleted`)
                .addFields(
                    { name: 'Channel', value: `${interaction.channel}`, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true }
                )
                .setTimestamp();

            if (target) {
                embed.addFields({ name: 'From User', value: target.tag, inline: true });
            }

            await interaction.editReply({ embeds: [embed] });

            // Delete the reply after 5 seconds
            setTimeout(async () => {
                try {
                    await interaction.deleteReply();
                } catch (error) {
                    console.log('Could not delete reply');
                }
            }, 5000);

        } catch (error) {
            console.error('Error clearing messages:', error);
            await interaction.editReply('❌ An error occurred while deleting messages.');
        }
    },
};