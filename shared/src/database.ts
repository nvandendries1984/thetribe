import { MongoClient, Db, Collection, Document } from 'mongodb';
import { GuildConfig, UserData } from './types';

export class DatabaseManager {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  constructor(private connectionString: string, private dbName: string) {}

  async connect(): Promise<void> {
    try {
      this.client = new MongoClient(this.connectionString);
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      console.log('Connected to MongoDB successfully');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('Disconnected from MongoDB');
    }
  }

  getDatabase(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  getCollection<T extends Document = Document>(name: string): Collection<T> {
    return this.getDatabase().collection<T>(name);
  }

  // Guild Configuration Methods
  async getGuildConfig(guildId: string): Promise<GuildConfig | null> {
    const collection = this.getCollection<GuildConfig>('guilds');
    return await collection.findOne({ guildId });
  }

  async setGuildConfig(config: GuildConfig): Promise<void> {
    const collection = this.getCollection<GuildConfig>('guilds');
    await collection.replaceOne(
      { guildId: config.guildId },
      { ...config, updatedAt: new Date() },
      { upsert: true }
    );
  }

  async updateGuildConfig(guildId: string, update: Partial<GuildConfig>): Promise<void> {
    const collection = this.getCollection<GuildConfig>('guilds');
    await collection.updateOne(
      { guildId },
      { $set: { ...update, updatedAt: new Date() } }
    );
  }

  // User Data Methods
  async getUserData(userId: string, guildId: string): Promise<UserData | null> {
    const collection = this.getCollection<UserData>('users');
    return await collection.findOne({ userId, guildId });
  }

  async setUserData(userData: UserData): Promise<void> {
    const collection = this.getCollection<UserData>('users');
    await collection.replaceOne(
      { userId: userData.userId, guildId: userData.guildId },
      { ...userData, updatedAt: new Date() },
      { upsert: true }
    );
  }

  async updateUserData(
    userId: string,
    guildId: string,
    update: Partial<UserData>
  ): Promise<void> {
    const collection = this.getCollection<UserData>('users');
    await collection.updateOne(
      { userId, guildId },
      { $set: { ...update, updatedAt: new Date() } }
    );
  }
}