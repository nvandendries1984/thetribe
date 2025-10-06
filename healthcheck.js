// Health check script for Docker
const mongoose = require('mongoose');

async function healthCheck() {
    try {
        // Check if the process is running
        if (!process.env.DISCORD_TOKEN) {
            console.error('Health check failed: DISCORD_TOKEN not set');
            process.exit(1);
        }

        // Check MongoDB connection
        if (mongoose.connection.readyState === 1) {
            console.log('Health check passed: Bot is healthy');
            process.exit(0);
        } else {
            console.error('Health check failed: MongoDB not connected');
            process.exit(1);
        }
    } catch (error) {
        console.error('Health check failed:', error.message);
        process.exit(1);
    }
}

healthCheck();