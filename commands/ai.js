const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// AI Command - TEMPORARILY DISABLED
// Rename back to 'ai' to re-enable
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai-disabled')
        .setDescription('[DISABLED] Ask TheTribe AI a question')
        .addStringOption(option =>
            option
                .setName('question')
                .setDescription('Your question for the AI')
                .setRequired(true)),

    async execute(interaction) {
        const question = interaction.options.getString('question');

        try {
            // Defer the reply since AI response might take time
            await interaction.deferReply();

            // Get OpenAI instance from the main bot file
            const OpenAI = require('openai');
            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });

            // Generate AI response
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are TheTribe Discord bot, a helpful assistant for The Tribe community. Be friendly, helpful, and concise in your responses. Keep responses under 2000 characters to fit Discord's message limit."
                    },
                    {
                        role: "user",
                        content: question
                    }
                ],
                max_tokens: 500,
                temperature: 0.7,
            });

            const aiResponse = completion.choices[0].message.content;

            // Create embed for the response
            const responseEmbed = new EmbedBuilder()
                .setColor('#00D4AA')
                .setAuthor({
                    name: 'TheTribe AI Assistant',
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setTitle(`Question: ${question.length > 100 ? question.substring(0, 100) + '...' : question}`)
                .setDescription(aiResponse)
                .setFooter({
                    text: `Asked by ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [responseEmbed] });

        } catch (error) {
            console.error('❌ Error generating AI response:', error);

            let errorMessage = 'Sorry, I encountered an error while processing your question. Please try again later.';
            let errorTitle = '❌ AI Error';

            // Handle specific OpenAI errors
            if (error.status === 429) {
                errorTitle = '💳 Quota Exceeded';
                errorMessage = 'Sorry, the AI service is currently unavailable due to quota limits. Please contact the bot administrator to check the OpenAI billing settings.';
            } else if (error.status === 401) {
                errorTitle = '🔑 Authentication Error';
                errorMessage = 'AI service authentication failed. Please contact the bot administrator.';
            } else if (error.status === 500) {
                errorTitle = '🔧 Service Unavailable';
                errorMessage = 'OpenAI service is temporarily unavailable. Please try again in a few minutes.';
            }

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle(errorTitle)
                .setDescription(errorMessage)
                .addFields(
                    { name: '💡 Tip', value: 'You can still use all other bot commands normally!', inline: false }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};