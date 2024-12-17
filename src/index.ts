import { config } from 'dotenv';
import { Hono } from 'hono';
import { Logger } from './helper/logger';
import { serverless } from './helper';
import { listeningQueue } from './listener';
import { handleCreateUser } from './listener/create-user';

config();

const app = new Hono();
const port = process.env.PORT || 8989;

async function startListener() {
  try {
    Logger.info('Starting listener...');
    await listeningQueue('USER_REGISTRATION', handleCreateUser);
    Logger.info('Listener started successfully.');
  } catch (error) {
    Logger.error('Failed to start listener:', error);
    // Optionally, you might want to throw the error to prevent server startup
    throw error;
  }
}

app.get('/', (c) => {
  return c.json({ message: 'Cron job is running every 3 minutes.' });
});

app.notFound((c) => c.text('Route not found', 404));

const server = serverless(app);

// Modify the server startup to ensure listener starts before server
server.listen(port, async () => {
  try {
    // Start the listener before logging server startup
    await startListener();
    
    Logger.info(`[Hono-Service] Server is running on port ${port}`);
  } catch (error) {
    Logger.error('Failed to start server and listener:', error);
    // You might want to add additional error handling here
    process.exit(1);
  }
});
