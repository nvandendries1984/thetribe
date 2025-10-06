const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        console.log(`${member.user.tag} left ${member.guild.name}`);

        // Find a general/leave channel
        const leaveChannel = member.guild.channels.cache.find(
            channel => channel.name.includes('general') ||
                      channel.name.includes('goodbye') ||
                      channel.name.includes('algemeen') ||
                      channel.name.includes('logs')
        ) || member.guild.systemChannel;

        if (!leaveChannel) return;

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('👋 Goodbye')
            .setDescription(`**${member.user.tag}** has left the server`)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: 'Member Since', value: member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Unknown', inline: true },
                { name: 'Members Left', value: `${member.guild.memberCount}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `User ID: ${member.id}` });

        try {
            await leaveChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error sending leave message:', error);
        }
    },
};