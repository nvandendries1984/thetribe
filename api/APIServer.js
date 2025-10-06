const http = require('http');
const url = require('url');
const querystring = require('querystring');
const mongoose = require('mongoose');

class APIServer {
    constructor(client, port = 15016) {
        this.client = client;
        this.port = port;
        this.server = null;
    }

    start() {
        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        this.server.listen(this.port, () => {
            console.log(`🚀 API Server running on http://localhost:${this.port}`);
            console.log(`📚 API Documentation available at http://localhost:${this.port}/docs`);
        });

        return this.server;
    }

    handleRequest(req, res) {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        const parsedUrl = url.parse(req.url, true);
        const path = parsedUrl.pathname;
        const method = req.method;

        // Route handling
        try {
            if (path === '/docs' && method === 'GET') {
                this.serveDocs(req, res);
            } else if (path === '/api/status' && method === 'GET') {
                this.getStatus(req, res);
            } else if (path === '/api/guilds' && method === 'GET') {
                this.getGuilds(req, res);
            } else if (path.startsWith('/api/guilds/') && method === 'GET') {
                const guildId = path.split('/')[3];
                this.getGuild(req, res, guildId);
            } else if (path.startsWith('/api/guilds/') && path.endsWith('/members') && method === 'GET') {
                const guildId = path.split('/')[3];
                this.getGuildMembers(req, res, guildId, parsedUrl.query);
            } else if (path.startsWith('/api/guilds/') && path.includes('/members/') && method === 'GET') {
                const parts = path.split('/');
                const guildId = parts[3];
                const userId = parts[5];
                this.getGuildMember(req, res, guildId, userId);
            } else if (path === '/api/commands' && method === 'GET') {
                this.getCommands(req, res);
            } else if (path === '/api/warnings' && method === 'GET') {
                this.getWarnings(req, res, parsedUrl.query);
            } else if (path.startsWith('/api/warnings/') && method === 'GET') {
                const userId = path.split('/')[3];
                this.getUserWarnings(req, res, userId, parsedUrl.query);
            } else if (path === '/api/modlogs' && method === 'GET') {
                this.getModLogs(req, res, parsedUrl.query);
            } else if (path === '/api/stats' && method === 'GET') {
                this.getStats(req, res);
            } else {
                this.notFound(req, res);
            }
        } catch (error) {
            this.handleError(req, res, error);
        }
    }

    // API Documentation
    serveDocs(req, res) {
        const docs = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TheTribe Discord Bot - API Documentation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background: #1a1a1a;
            color: #ffffff;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        h1, h2, h3 { color: #ffffff; }
        h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
        h2 { color: #4CAF50; margin-top: 30px; }
        .endpoint {
            background: #2a2a2a;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        .method {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            color: white;
        }
        .get { background: #4CAF50; }
        .post { background: #2196F3; }
        .put { background: #FF9800; }
        .delete { background: #F44336; }
        .url { font-family: 'Courier New', monospace; color: #81C784; }
        .params { background: #333; padding: 10px; border-radius: 4px; }
        .response { background: #1a1a1a; border: 1px solid #333; padding: 10px; border-radius: 4px; overflow-x: auto; }
        pre { margin: 0; }
        code { background: #333; padding: 2px 4px; border-radius: 3px; }
        .base-url { background: #2a2a2a; padding: 15px; border-radius: 8px; border: 1px solid #333; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 TheTribe Discord Bot API Documentation</h1>

        <div class="base-url">
            <h3>Base URL</h3>
            <p><code>http://localhost:15016</code> or <code>https://thetribe.bytebees.dev</code></p>
        </div>

        <h2>📊 Status & Information</h2>

        <div class="endpoint">
            <h3><span class="method get">GET</span> <span class="url">/api/status</span></h3>
            <p>Get bot status information including uptime, guilds, users, and system metrics.</p>
            <div class="response">
                <pre>{
  "status": "online",
  "timestamp": "2025-10-06T10:00:00.000Z",
  "bot": {
    "ready": true,
    "guildCount": 5,
    "userCount": 1250,
    "ping": 45
  },
  "database": {
    "connected": true,
    "readyState": 1
  },
  "system": {
    "uptime": 3600,
    "memory": {
      "used": 28261856,
      "total": 31023104
    }
  }
}</pre>
            </div>
        </div>

        <div class="endpoint">
            <h3><span class="method get">GET</span> <span class="url">/api/stats</span></h3>
            <p>Get detailed bot statistics including command usage and moderation metrics.</p>
            <div class="response">
                <pre>{
  "totalWarnings": 45,
  "totalBans": 12,
  "totalKicks": 8,
  "totalTimeouts": 23,
  "guilds": 5,
  "users": 1250,
  "uptime": "2d 4h 15m"
}</pre>
            </div>
        </div>

        <h2>🏰 Guild Management</h2>

        <div class="endpoint">
            <h3><span class="method get">GET</span> <span class="url">/api/guilds</span></h3>
            <p>Get list of all guilds the bot is in.</p>
            <div class="response">
                <pre>[
  {
    "id": "123456789012345678",
    "name": "My Discord Server",
    "memberCount": 250,
    "owner": false,
    "permissions": ["ADMINISTRATOR"]
  }
]</pre>
            </div>
        </div>

        <div class="endpoint">
            <h3><span class="method get">GET</span> <span class="url">/api/guilds/{guildId}</span></h3>
            <p>Get detailed information about a specific guild.</p>
            <div class="params">
                <strong>Parameters:</strong><br>
                <code>guildId</code> - Discord Guild ID
            </div>
            <div class="response">
                <pre>{
  "id": "123456789012345678",
  "name": "My Discord Server",
  "description": "A great Discord server",
  "memberCount": 250,
  "owner": {
    "id": "987654321098765432",
    "username": "ServerOwner",
    "avatar": "avatar_hash"
  },
  "channels": 15,
  "roles": 8,
  "createdAt": "2023-01-15T10:30:00.000Z"
}</pre>
            </div>
        </div>

        <div class="endpoint">
            <h3><span class="method get">GET</span> <span class="url">/api/guilds/{guildId}/members</span></h3>
            <p>Get list of members in a guild.</p>
            <div class="params">
                <strong>Parameters:</strong><br>
                <code>guildId</code> - Discord Guild ID<br>
                <strong>Query Parameters:</strong><br>
                <code>limit</code> - Number of members to return (default: 50, max: 1000)<br>
                <code>after</code> - User ID to start after (for pagination)
            </div>
        </div>

        <div class="endpoint">
            <h3><span class="method get">GET</span> <span class="url">/api/guilds/{guildId}/members/{userId}</span></h3>
            <p>Get detailed information about a specific guild member.</p>
            <div class="params">
                <strong>Parameters:</strong><br>
                <code>guildId</code> - Discord Guild ID<br>
                <code>userId</code> - Discord User ID
            </div>
        </div>

        <h2>⚡ Commands</h2>

        <div class="endpoint">
            <h3><span class="method get">GET</span> <span class="url">/api/commands</span></h3>
            <p>Get list of all available bot commands.</p>
            <div class="response">
                <pre>[
  {
    "name": "ping",
    "description": "Check bot latency",
    "category": "utility"
  },
  {
    "name": "ban",
    "description": "Ban a member from the server",
    "category": "moderation"
  }
]</pre>
            </div>
        </div>

        <h2>⚠️ Moderation</h2>

        <div class="endpoint">
            <h3><span class="method get">GET</span> <span class="url">/api/warnings</span></h3>
            <p>Get list of all warnings across all guilds.</p>
            <div class="params">
                <strong>Query Parameters:</strong><br>
                <code>guild</code> - Filter by Guild ID<br>
                <code>user</code> - Filter by User ID<br>
                <code>limit</code> - Number of warnings to return (default: 50)<br>
                <code>skip</code> - Number of warnings to skip (pagination)
            </div>
        </div>

        <div class="endpoint">
            <h3><span class="method get">GET</span> <span class="url">/api/warnings/{userId}</span></h3>
            <p>Get all warnings for a specific user.</p>
            <div class="params">
                <strong>Parameters:</strong><br>
                <code>userId</code> - Discord User ID<br>
                <strong>Query Parameters:</strong><br>
                <code>guild</code> - Filter by Guild ID
            </div>
        </div>

        <div class="endpoint">
            <h3><span class="method get">GET</span> <span class="url">/api/modlogs</span></h3>
            <p>Get moderation logs.</p>
            <div class="params">
                <strong>Query Parameters:</strong><br>
                <code>guild</code> - Filter by Guild ID<br>
                <code>action</code> - Filter by action type (ban, kick, timeout, warn)<br>
                <code>moderator</code> - Filter by Moderator ID<br>
                <code>limit</code> - Number of logs to return (default: 50)<br>
                <code>skip</code> - Number of logs to skip (pagination)
            </div>
        </div>

        <h2>🔐 Authentication</h2>
        <p>Currently, this API does not require authentication. In production, consider implementing API keys or OAuth2.</p>

        <h2>📝 Response Format</h2>
        <p>All API responses are in JSON format. Error responses include:</p>
        <div class="response">
            <pre>{
  "error": true,
  "message": "Error description",
  "code": 404
}</pre>
        </div>

        <h2>🚀 Rate Limiting</h2>
        <p>Currently no rate limiting is implemented. Consider implementing rate limiting for production use.</p>
    </div>
</body>
</html>`;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(docs);
    }

    // API Endpoints
    async getStatus(req, res) {
        const status = {
            status: this.client.isReady() ? 'online' : 'offline',
            timestamp: new Date().toISOString(),
            bot: {
                ready: this.client.isReady(),
                guildCount: this.client.guilds.cache.size,
                userCount: this.client.users.cache.size,
                ping: this.client.ws.ping
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

        this.sendJSON(res, status);
    }

    async getGuilds(req, res) {
        try {
            const guilds = this.client.guilds.cache.map(guild => ({
                id: guild.id,
                name: guild.name,
                memberCount: guild.memberCount,
                owner: guild.members.me?.permissions.has('ADMINISTRATOR') || false,
                permissions: guild.members.me?.permissions.toArray() || []
            }));

            this.sendJSON(res, guilds);
        } catch (error) {
            this.handleError(req, res, error);
        }
    }

    async getGuild(req, res, guildId) {
        try {
            const guild = this.client.guilds.cache.get(guildId);
            if (!guild) {
                return this.sendError(res, 'Guild not found', 404);
            }

            const guildData = {
                id: guild.id,
                name: guild.name,
                description: guild.description,
                memberCount: guild.memberCount,
                owner: {
                    id: guild.ownerId,
                    username: guild.members.cache.get(guild.ownerId)?.user.username || 'Unknown',
                    avatar: guild.members.cache.get(guild.ownerId)?.user.avatar || null
                },
                channels: guild.channels.cache.size,
                roles: guild.roles.cache.size,
                createdAt: guild.createdAt.toISOString()
            };

            this.sendJSON(res, guildData);
        } catch (error) {
            this.handleError(req, res, error);
        }
    }

    async getGuildMembers(req, res, guildId, query) {
        try {
            const guild = this.client.guilds.cache.get(guildId);
            if (!guild) {
                return this.sendError(res, 'Guild not found', 404);
            }

            const limit = Math.min(parseInt(query.limit) || 50, 1000);
            const after = query.after;

            let members = Array.from(guild.members.cache.values());

            if (after) {
                const afterIndex = members.findIndex(member => member.id === after);
                if (afterIndex !== -1) {
                    members = members.slice(afterIndex + 1);
                }
            }

            members = members.slice(0, limit);

            const memberData = members.map(member => ({
                id: member.id,
                username: member.user.username,
                displayName: member.displayName,
                avatar: member.user.avatar,
                joinedAt: member.joinedAt?.toISOString(),
                roles: member.roles.cache.map(role => ({
                    id: role.id,
                    name: role.name,
                    color: role.hexColor
                }))
            }));

            this.sendJSON(res, memberData);
        } catch (error) {
            this.handleError(req, res, error);
        }
    }

    async getGuildMember(req, res, guildId, userId) {
        try {
            const guild = this.client.guilds.cache.get(guildId);
            if (!guild) {
                return this.sendError(res, 'Guild not found', 404);
            }

            const member = guild.members.cache.get(userId);
            if (!member) {
                return this.sendError(res, 'Member not found', 404);
            }

            const memberData = {
                id: member.id,
                username: member.user.username,
                displayName: member.displayName,
                avatar: member.user.avatar,
                joinedAt: member.joinedAt?.toISOString(),
                premiumSince: member.premiumSince?.toISOString() || null,
                roles: member.roles.cache.map(role => ({
                    id: role.id,
                    name: role.name,
                    color: role.hexColor,
                    permissions: role.permissions.toArray()
                })),
                permissions: member.permissions.toArray()
            };

            this.sendJSON(res, memberData);
        } catch (error) {
            this.handleError(req, res, error);
        }
    }

    async getCommands(req, res) {
        try {
            const commands = Array.from(this.client.commands.values()).map(command => ({
                name: command.data.name,
                description: command.data.description,
                category: this.getCommandCategory(command.data.name)
            }));

            this.sendJSON(res, commands);
        } catch (error) {
            this.handleError(req, res, error);
        }
    }

    async getWarnings(req, res, query) {
        try {
            const Warning = require('./models/Warning');

            const filter = {};
            if (query.guild) filter.guildId = query.guild;
            if (query.user) filter.userId = query.user;

            const limit = parseInt(query.limit) || 50;
            const skip = parseInt(query.skip) || 0;

            const warnings = await Warning.find(filter)
                .limit(limit)
                .skip(skip)
                .sort({ createdAt: -1 });

            this.sendJSON(res, warnings);
        } catch (error) {
            this.handleError(req, res, error);
        }
    }

    async getUserWarnings(req, res, userId, query) {
        try {
            const Warning = require('./models/Warning');

            const filter = { userId };
            if (query.guild) filter.guildId = query.guild;

            const warnings = await Warning.find(filter).sort({ createdAt: -1 });

            this.sendJSON(res, warnings);
        } catch (error) {
            this.handleError(req, res, error);
        }
    }

    async getModLogs(req, res, query) {
        try {
            const ModerationLog = require('./models/ModerationLog');

            const filter = {};
            if (query.guild) filter.guildId = query.guild;
            if (query.action) filter.action = query.action;
            if (query.moderator) filter.moderatorId = query.moderator;

            const limit = parseInt(query.limit) || 50;
            const skip = parseInt(query.skip) || 0;

            const logs = await ModerationLog.find(filter)
                .limit(limit)
                .skip(skip)
                .sort({ createdAt: -1 });

            this.sendJSON(res, logs);
        } catch (error) {
            this.handleError(req, res, error);
        }
    }

    async getStats(req, res) {
        try {
            const Warning = require('./models/Warning');
            const ModerationLog = require('./models/ModerationLog');

            const [totalWarnings, modLogs] = await Promise.all([
                Warning.countDocuments(),
                ModerationLog.aggregate([
                    {
                        $group: {
                            _id: '$action',
                            count: { $sum: 1 }
                        }
                    }
                ])
            ]);

            const modStats = {};
            modLogs.forEach(log => {
                modStats[log._id] = log.count;
            });

            const stats = {
                totalWarnings,
                totalBans: modStats.ban || 0,
                totalKicks: modStats.kick || 0,
                totalTimeouts: modStats.timeout || 0,
                guilds: this.client.guilds.cache.size,
                users: this.client.users.cache.size,
                uptime: this.formatUptime(process.uptime())
            };

            this.sendJSON(res, stats);
        } catch (error) {
            this.handleError(req, res, error);
        }
    }

    // Utility methods
    getCommandCategory(commandName) {
        const moderationCommands = ['ban', 'kick', 'timeout', 'warn', 'warnings', 'clear', 'automod'];
        const utilityCommands = ['ping', 'help', 'info'];

        if (moderationCommands.includes(commandName)) return 'moderation';
        if (utilityCommands.includes(commandName)) return 'utility';
        return 'other';
    }

    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    sendJSON(res, data) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data, null, 2));
    }

    sendError(res, message, statusCode = 500) {
        const errorResponse = {
            error: true,
            message,
            code: statusCode
        };

        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(errorResponse, null, 2));
    }

    notFound(req, res) {
        this.sendError(res, 'Endpoint not found', 404);
    }

    handleError(req, res, error) {
        console.error('API Error:', error);
        this.sendError(res, error.message || 'Internal server error', 500);
    }
}

module.exports = APIServer;