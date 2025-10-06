const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// AI Test Command - TEMPORARILY DISABLED
// Rename back to 'aitest' to re-enable
module.exports = {
    data: new SlashCommandBuilder()
        .setName('aitest-disabled')
        .setDescription('[DISABLED] Test the OpenAI API connection')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            // Get OpenAI instance
            const OpenAI = require('openai');
            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });

            // Test simple completion
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "user",
                        content: "Say 'Hello, I am working!' in exactly 5 words."
                    }
                ],
                max_tokens: 20,
                temperature: 0.1,
            });

            const testResponse = completion.choices[0].message.content;

            const successEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ OpenAI API Test Successful')
                .setDescription('The AI service is working correctly!')
                .addFields(
                    { name: 'Test Response', value: testResponse, inline: false },
                    { name: 'Status', value: 'Connection established and working', inline: false }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('❌ OpenAI API Test Failed:', error);

            let errorMessage = 'Unknown error occurred during API test.';
            let errorTitle = '❌ API Test Failed';
            let troubleshooting = 'Check bot logs for more details.';

            if (error.status === 429) {
                errorTitle = '💳 Quota Exceeded';
                errorMessage = 'Your OpenAI API quota has been exceeded.';
                troubleshooting = 'Check your OpenAI billing settings and add credits to your account.';
            } else if (error.status === 401) {
                errorTitle = '🔑 Authentication Failed';
                errorMessage = 'Invalid or missing OpenAI API key.';
                troubleshooting = 'Verify your OPENAI_API_KEY in the environment variables.';
            } else if (error.status === 500) {
                errorTitle = '🔧 OpenAI Service Error';
                errorMessage = 'OpenAI service is experiencing issues.';
                troubleshooting = 'Try again later or check OpenAI status page.';
            }

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle(errorTitle)
                .setDescription(errorMessage)
                .addFields(
                    { name: '🔧 Troubleshooting', value: troubleshooting, inline: false },
                    { name: 'Error Code', value: error.status ? `${error.status}` : 'Unknown', inline: true },
                    { name: 'Error Type', value: error.type || 'Unknown', inline: true }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};