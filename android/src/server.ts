import express from 'express';
import cors from 'cors';
import { fileRouter } from './routes/files.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api', fileRouter);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
}
