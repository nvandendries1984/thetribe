const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Shows information about the bot, server, or user')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of information')
                .setRequired(true)
                .addChoices(
                    { name: 'Bot', value: 'bot' },
                    { name: 'Server', value: 'server' },
                    { name: 'User', value: 'user' }
                ))
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Select a user (only for user info)')
                .setRequired(false)),

    async execute(interaction) {
        const type = interaction.options.getString('type');
        const targetUser = interaction.options.getUser('target') || interaction.user;

        let embed;

        switch(type) {
            case 'bot':
                embed = new EmbedBuilder()
                    .setColor('#0099FF')
                    .setTitle('🤖 Bot Information')
                    .setThumbnail(interaction.client.user.displayAvatarURL())
                    .addFields(
                        { name: 'Bot Name', value: interaction.client.user.tag, inline: true },
                        { name: 'Bot ID', value: interaction.client.user.id, inline: true },
                        { name: 'Created', value: `<t:${Math.floor(interaction.client.user.createdTimestamp / 1000)}:F>`, inline: false },
                        { name: 'Servers', value: `${interaction.client.guilds.cache.size}`, inline: true },
                        { name: 'Users', value: `${interaction.client.users.cache.size}`, inline: true },
                        { name: 'Uptime', value: `<t:${Math.floor((Date.now() - interaction.client.uptime) / 1000)}:R>`, inline: true }
                    )
                    .setTimestamp();
                break;

            case 'server':
                const guild = interaction.guild;
                embed = new EmbedBuilder()
                    .setColor('#FF9900')
                    .setTitle('🏰 Server Information')
                    .setThumbnail(guild.iconURL())
                    .addFields(
                        { name: 'Server Name', value: guild.name, inline: true },
                        { name: 'Server ID', value: guild.id, inline: true },
                        { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
                        { name: 'Members', value: `${guild.memberCount}`, inline: true },
                        { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
                        { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
                        { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false }
                    )
                    .setTimestamp();
                break;

            case 'user':
                const member = await interaction.guild.members.fetch(targetUser.id);
                embed = new EmbedBuilder()
                    .setColor('#9900FF')
                    .setTitle('👤 User Information')
                    .setThumbnail(targetUser.displayAvatarURL())
                    .addFields(
                        { name: 'Username', value: targetUser.tag, inline: true },
                        { name: 'ID', value: targetUser.id, inline: true },
                        { name: 'Nickname', value: member.nickname || 'None', inline: true },
                        { name: 'Account Created', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>`, inline: false },
                        { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
                        { name: 'Roles', value: member.roles.cache.filter(role => role.name !== '@everyone').map(role => role.toString()).join(', ') || 'None', inline: false }
                    )
                    .setTimestamp();
                break;
        }

        await interaction.reply({ embeds: [embed] });
    },
};