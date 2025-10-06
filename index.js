const { Client, GatewayIntentBits, Collection, Events, EmbedBuilder, PermissionFlagsBits, REST, Routes } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const http = require('http');
// const OpenAI = require('openai'); // TEMPORARILY DISABLED
require('dotenv').config();

// Initialize OpenAI - TEMPORARILY DISABLED
// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// });

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution
    ]
});

// Create collections for commands and cooldowns
client.commands = new Collection();
client.cooldowns = new Collection();

// Deploy slash commands
async function deployCommands() {
    const commands = [];

    // Grab all the command files from the commands directory
    const commandsPath = path.join(__dirname, 'commands');
    if (fs.existsSync(commandsPath)) {
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            } else {
                console.log(`⚠️ Warning: Command at ${filePath} is missing required "data" or "execute" property.`);
            }
        }
    }

    // Construct and prepare an instance of the REST module
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);

    try {
        console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`);

        // Deploy commands globally for multi-guild support
        const data = await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: commands },
        );

        console.log(`✅ Successfully deployed ${data.length} application (/) commands.`);
    } catch (error) {
        console.error('❌ Error deploying commands:', error);
        throw error;
    }
}

// MongoDB connection with retry logic
async function connectToDatabase() {
    const maxRetries = 5;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                serverSelectionTimeoutMS: 30000, // 30 seconds
                socketTimeoutMS: 45000, // 45 seconds
                maxPoolSize: 10,
                retryWrites: true,
                retryReads: true
            });
            console.log('✅ Connected to MongoDB');

            // Handle connection events
            mongoose.connection.on('error', (error) => {
                console.error('MongoDB connection error:', error);
            });

            mongoose.connection.on('disconnected', () => {
                console.log('MongoDB disconnected');
            });

            mongoose.connection.on('reconnected', () => {
                console.log('MongoDB reconnected');
            });

            return;
        } catch (error) {
            retries++;
            console.error(`❌ MongoDB connection attempt ${retries}/${maxRetries} failed:`, error.message);

            if (retries >= maxRetries) {
                console.error('❌ Could not connect to MongoDB after maximum retries');
                process.exit(1);
            }

            // Wait before retrying (exponential backoff)
            const delay = Math.min(1000 * Math.pow(2, retries), 10000);
            console.log(`⏳ Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Health check server for Portainer
// Create health check server and web interface
function createHealthCheckServer() {
    const server = http.createServer((req, res) => {
        // Set CORS headers for all requests
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        if (req.url === '/health') {
            const healthData = {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                bot: {
                    ready: client.isReady(),
                    guildCount: client.guilds.cache.size,
                    userCount: client.users.cache.size,
                    ping: client.ws.ping
                },
                database: {
                    connected: mongoose.connection.readyState === 1,
                    readyState: mongoose.connection.readyState
                },
                system: {
                    uptime: Math.floor(process.uptime()),
                    memory: {
                        used: process.memoryUsage().heapUsed,
                        total: process.memoryUsage().heapTotal
                    }
                }
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(healthData, null, 2));
        } else {
            // Serve web interface files
            const webPath = path.join(__dirname, 'web');
            let filePath;

            if (req.url === '/' || req.url === '/index.html') {
                filePath = path.join(webPath, 'index.html');
            } else if (req.url === '/api-docs' || req.url === '/api-docs.html') {
                filePath = path.join(webPath, 'api-docs.html');
            } else if (req.url === '/style.css') {
                filePath = path.join(webPath, 'style.css');
            } else if (req.url === '/api-docs.css') {
                filePath = path.join(webPath, 'api-docs.css');
            } else if (req.url === '/script.js') {
                filePath = path.join(webPath, 'script.js');
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
                return;
            }

            // Check if file exists and serve it
            if (fs.existsSync(filePath)) {
                const ext = path.extname(filePath);
                let contentType = 'text/plain';

                switch (ext) {
                    case '.html':
                        contentType = 'text/html';
                        break;
                    case '.css':
                        contentType = 'text/css';
                        break;
                    case '.js':
                        contentType = 'application/javascript';
                        break;
                }

                fs.readFile(filePath, (err, content) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Internal Server Error');
                    } else {
                        res.writeHead(200, { 'Content-Type': contentType });
                        res.end(content);
                    }
                });
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
        }
    });

    server.listen(15015, () => {
        console.log('🏥 Health check server running on http://localhost:15015');
        console.log('🌐 Web dashboard available at http://localhost:15015');
    });

    return server;
}

// Load commands

const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`✅ Loaded command: ${command.data.name}`);
        } else {
            console.log(`⚠️ Warning: Command at ${filePath} is missing required "data" or "execute" property.`);
        }
    }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
        console.log(`✅ Loaded event: ${event.name}`);
    }
}

// Ready event
client.once(Events.ClientReady, async (readyClient) => {
    console.log(`🤖 Bot is online as ${readyClient.user.tag}!`);
    console.log(`📊 Serving ${readyClient.guilds.cache.size} guilds with ${readyClient.users.cache.size} users`);

    try {
        // Deploy commands first
        await deployCommands();

        // Connect to database
        await connectToDatabase();

        // Start health check server
        createHealthCheckServer();

        // Start API server
        const APIServer = require('./api/APIServer');
        const apiServer = new APIServer(client, 15016);
        apiServer.start();

        // Set bot status
        client.user.setActivity(`${readyClient.guilds.cache.size} servers`, { type: 'WATCHING' });

        console.log('🚀 Bot is fully initialized and ready!');
    } catch (error) {
        console.error('❌ Error during bot initialization:', error);
        process.exit(1);
    }
});

// AI Response handler for mentions - TEMPORARILY DISABLED
// Uncomment the code below to re-enable AI responses via mentions
/*
client.on(Events.MessageCreate, async message => {
    // Ignore messages from bots
    if (message.author.bot) return;

    // Check if the bot is mentioned
    if (message.mentions.has(client.user)) {
        // Remove the mention from the message to get the actual question
        const question = message.content.replace(/<@!?\d+>/g, '').trim();

        // If there's no question after removing mentions, ignore
        if (!question) return;

        try {
            // Show typing indicator
            await message.channel.sendTyping();

            // Generate AI response using OpenAI
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
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription(aiResponse)
                .setFooter({
                    text: `Asked by ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setTimestamp();

            // Reply to the message
            await message.reply({ embeds: [responseEmbed] });

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

            await message.reply({ embeds: [errorEmbed] });
        }
    }
});
*/

// Interaction handling
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    // Cooldown handling
    const { cooldowns } = client;

    if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const defaultCooldownDuration = 3;
    const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

    if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
            const expiredTimestamp = Math.round(expirationTime / 1000);
            return interaction.reply({
                content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
                flags: 64
            });
        }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    // Execute command
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`, error);

        const errorEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Command Error')
            .setDescription('There was an error while executing this command!')
            .setTimestamp();

        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], flags: 64 });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: 64 });
            }
        } catch (interactionError) {
            console.error('Failed to respond to interaction:', interactionError);
        }
    }
});

// Error handling
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error);
    process.exit(1);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);