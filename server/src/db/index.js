// Shared DB service for Mongoose
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let connection = null;
const models = {};

export async function connectDB() {
  if (connection) return connection;
  const {
    DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_AUTH
  } = process.env;
  let uri = '';
  if (DB_USER && DB_PASS) {
    uri = `mongodb://${DB_USER}:${encodeURIComponent(DB_PASS)}@${DB_HOST}/${DB_NAME}?authSource=${DB_AUTH || 'admin'}`;
  } else {
    uri = `mongodb://${DB_HOST}/${DB_NAME}`;
  }
  connection = await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
  });
  return connection;
}

export function getConnection() {
  if (!connection) throw new Error('DB not connected');
  return mongoose.connection;
}

export function registerModel(name, schema) {
  if (!models[name]) {
    models[name] = mongoose.model(name, schema);
  }
  return models[name];
}
