import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { apiRouter } from './src/server/routes';

dotenv.config();

async function startServer() {
  const app = express();
  const isProduction = process.env.NODE_ENV === 'production';
  const PORT = isProduction ? (Number(process.env.PORT) || 3000) : 3000;

  // Parse JSON bodies
  app.use(express.json());

  // Mount API router under /api
  app.use('/api', apiRouter);

  // Mount Vite middlewares in development or serve static files in production
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DineFlow] Server listening at http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch(err => {
  console.error('[DineFlow] Failed to start server:', err);
  process.exit(1);
});
