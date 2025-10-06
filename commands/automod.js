const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, AutoModerationRuleTriggerType, AutoModerationActionType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('automod')
        .setDescription('Manage AutoMod rules')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new AutoMod rule')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type of AutoMod rule')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Spam Messages', value: 'spam' },
                            { name: 'Keywords', value: 'keyword' },
                            { name: 'Mention Spam', value: 'mention' }
                        ))
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name for the AutoMod rule')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('keywords')
                        .setDescription('Keywords separated by commas (only for keyword type)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Show all AutoMod rules'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete an AutoMod rule')
                .addStringOption(option =>
                    option.setName('rule-id')
                        .setDescription('ID of the rule to delete')
                        .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'create':
                await this.createRule(interaction);
                break;
            case 'list':
                await this.listRules(interaction);
                break;
            case 'delete':
                await this.deleteRule(interaction);
                break;
        }
    },

    async createRule(interaction) {
        const type = interaction.options.getString('type');
        const name = interaction.options.getString('name');
        const keywords = interaction.options.getString('keywords');

        await interaction.deferReply();

        try {
            let ruleData = {
                name: name,
                enabled: true,
                actions: [
                    {
                        type: AutoModerationActionType.BlockMessage,
                        metadata: {
                            customMessage: 'Dit bericht is geblokkeerd door AutoMod.'
                        }
                    },
                    {
                        type: AutoModerationActionType.SendAlertMessage,
                        metadata: {
                            channel: interaction.channel
                        }
                    }
                ]
            };

            switch (type) {
                case 'spam':
                    ruleData.triggerType = AutoModerationRuleTriggerType.Spam;
                    break;

                case 'keyword':
                    if (!keywords) {
                        return interaction.editReply('❌ Trefwoorden zijn vereist voor keyword regels!');
                    }
                    ruleData.triggerType = AutoModerationRuleTriggerType.Keyword;
                    ruleData.triggerMetadata = {
                        keywordFilter: keywords.split(',').map(word => word.trim())
                    };
                    break;

                case 'mention':
                    ruleData.triggerType = AutoModerationRuleTriggerType.MentionSpam;
                    ruleData.triggerMetadata = {
                        mentionTotalLimit: 5
                    };
                    break;
            }

            const rule = await interaction.guild.autoModerationRules.create(ruleData);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ AutoMod Regel Aangemaakt')
                .setDescription(`AutoMod regel **${rule.name}** is succesvol aangemaakt!`)
                .addFields(
                    { name: 'Regel ID', value: rule.id, inline: true },
                    { name: 'Type', value: type, inline: true },
                    { name: 'Status', value: rule.enabled ? 'Ingeschakeld' : 'Uitgeschakeld', inline: true }
                )
                .setTimestamp();

            if (type === 'keyword' && keywords) {
                embed.addFields({ name: 'Trefwoorden', value: keywords, inline: false });
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error creating automod rule:', error);
            await interaction.editReply('❌ Er is een fout opgetreden bij het aanmaken van de AutoMod regel.');
        }
    },

    async listRules(interaction) {
        await interaction.deferReply();

        try {
            const rules = await interaction.guild.autoModerationRules.fetch();

            if (rules.size === 0) {
                return interaction.editReply('📝 Er zijn geen AutoMod regels ingesteld.');
            }

            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('📋 AutoMod Regels')
                .setDescription(`Er zijn **${rules.size}** AutoMod regels ingesteld:`)
                .setTimestamp();

            rules.forEach(rule => {
                const status = rule.enabled ? '✅ Ingeschakeld' : '❌ Uitgeschakeld';
                const triggerType = this.getTriggerTypeName(rule.triggerType);

                embed.addFields({
                    name: `${rule.name} (${rule.id})`,
                    value: `**Type:** ${triggerType}\n**Status:** ${status}`,
                    inline: true
                });
            });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error listing automod rules:', error);
            await interaction.editReply('❌ Er is een fout opgetreden bij het ophalen van AutoMod regels.');
        }
    },

    async deleteRule(interaction) {
        const ruleId = interaction.options.getString('rule-id');

        await interaction.deferReply();

        try {
            const rule = await interaction.guild.autoModerationRules.fetch(ruleId);

            if (!rule) {
                return interaction.editReply('❌ AutoMod regel niet gevonden!');
            }

            await rule.delete();

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🗑️ AutoMod Regel Verwijderd')
                .setDescription(`AutoMod regel **${rule.name}** is succesvol verwijderd!`)
                .addFields(
                    { name: 'Regel ID', value: ruleId, inline: true }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error deleting automod rule:', error);
            await interaction.editReply('❌ Er is een fout opgetreden bij het verwijderen van de AutoMod regel.');
        }
    },

    getTriggerTypeName(triggerType) {
        switch (triggerType) {
            case AutoModerationRuleTriggerType.Keyword:
                return 'Trefwoorden';
            case AutoModerationRuleTriggerType.Spam:
                return 'Spam';
            case AutoModerationRuleTriggerType.KeywordPreset:
                return 'Voorinstelling';
            case AutoModerationRuleTriggerType.MentionSpam:
                return 'Mention Spam';
            default:
                return 'Onbekend';
        }
    }
};