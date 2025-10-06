const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        console.log(`${member.user.tag} joined ${member.guild.name}`);

        // Find a general/welcome channel
        const welcomeChannel = member.guild.channels.cache.find(
            channel => channel.name.includes('general') ||
                      channel.name.includes('welcome') ||
                      channel.name.includes('algemeen')
        ) || member.guild.systemChannel;

        if (!welcomeChannel) return;

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('👋 Welcome!')
            .setDescription(`Welcome to **${member.guild.name}**, ${member}!`)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: 'Member #', value: `${member.guild.memberCount}`, inline: true },
                { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `User ID: ${member.id}` });

        try {
            await welcomeChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error sending welcome message:', error);
        }
    },
};