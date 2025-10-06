const { Client, GatewayIntentBits, Collection, Events, EmbedBuilder, PermissionFlagsBits, REST, Routes } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const http = require('http');
require('dotenv').config();

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

// MongoDB connection
async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
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
});// Interaction handling
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
                ephemeral: true
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

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
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