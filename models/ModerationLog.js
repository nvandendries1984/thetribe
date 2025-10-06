const mongoose = require('mongoose');

const moderationLogSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    moderatorId: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['kick', 'ban', 'timeout', 'warn', 'unban']
    },
    reason: {
        type: String,
        default: 'Geen reden opgegeven'
    },
    duration: {
        type: Number, // in milliseconds for timeouts
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ModerationLog', moderationLogSchema);