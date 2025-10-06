// MongoDB initialization script
db = db.getSiblingDB('thetribe');

// Create collections if they don't exist
db.createCollection('moderationlogs');
db.createCollection('userwarnings');

// Create indexes for better performance
db.moderationlogs.createIndex({ "guildId": 1, "userId": 1 });
db.moderationlogs.createIndex({ "createdAt": -1 });

db.userwarnings.createIndex({ "guildId": 1, "userId": 1 });
db.userwarnings.createIndex({ "active": 1 });
db.userwarnings.createIndex({ "createdAt": -1 });

print('Database initialized successfully');