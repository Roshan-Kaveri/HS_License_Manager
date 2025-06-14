// src/server.ts
import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/db';

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

// First connect to DB, then start server
connectDB().then(() => {
  app.listen(PORT,'0.0.0.0', () => {
    console.log(`🚀 Server running on port : ${PORT}`);
  });
});
