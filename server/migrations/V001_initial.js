// Initial migration: create moderation index, seed default guild config
export async function up(db) {
  // Ensure index
  await db.collection('moderationlogs').createIndex({ guildId: 1, userId: 1 });
  // Seed default config (example)
  await db.collection('guildconfigs').insertOne({
    guildId: 'default',
    prefix: '!',
    createdAt: new Date(),
  });
}

export async function down(db) {
  await db.collection('guildconfigs').deleteOne({ guildId: 'default' });
  // Optionally drop index
  // await db.collection('moderationlogs').dropIndex('guildId_1_userId_1');
}
