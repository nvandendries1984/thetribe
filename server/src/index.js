// Main server entrypoint
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, registerModel } from './db/index.js';
import moderation from './modules/moderation/index.js';
// ...import other modules
import './bot/index.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Register modules
moderation(app, registerModel);
// ...register other modules

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
  });
});
