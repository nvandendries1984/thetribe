const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.AutoModerationActionExecution,
    async execute(autoModerationActionExecution) {
        const { action, guild, user, channel, content, rule } = autoModerationActionExecution;

        console.log(`AutoMod action executed: ${rule.name} for ${user.tag}`);

        // Find a moderation log channel
        const logChannel = guild.channels.cache.find(
            channel => channel.name.includes('mod-log') ||
                      channel.name.includes('automod') ||
                      channel.name.includes('logs')
        );

        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor('#FF9900')
            .setTitle('🤖 AutoMod Actie')
            .setDescription(`AutoMod regel **${rule.name}** is geactiveerd`)
            .addFields(
                { name: 'Gebruiker', value: `${user.tag} (${user.id})`, inline: true },
                { name: 'Kanaal', value: `${channel}`, inline: true },
                { name: 'Regel', value: rule.name, inline: true },
                { name: 'Actie', value: this.getActionTypeName(action.type), inline: true }
            )
            .setTimestamp();

        if (content && content.length > 0) {
            embed.addFields({
                name: 'Bericht inhoud',
                value: content.length > 1000 ? content.substring(0, 1000) + '...' : content,
                inline: false
            });
        }

        try {
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error sending automod log:', error);
        }
    },

    getActionTypeName(actionType) {
        switch (actionType) {
            case 1: // BlockMessage
                return 'Bericht geblokkeerd';
            case 2: // SendAlertMessage
                return 'Alert bericht verzonden';
            case 3: // Timeout
                return 'Timeout gegeven';
            default:
                return 'Onbekende actie';
        }
    }
};