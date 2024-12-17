import { Hono } from 'hono';
import { listeningQueue } from './listener';
import { handleCreateUser } from './listener/create-user';
import { handleError } from './helper/eror-handling';
import schedule from 'node-schedule';
import { Logger } from './helper/logger';
import { serverless } from './helper/request';

const app = new Hono();
const port = 8989;

schedule.scheduleJob('*/3 * * * *', async () => {
  try {
    Logger.info('Starting listener...');
    await listeningQueue('USER_REGISTRATION', handleCreateUser);
    Logger.info('Listener started successfully.');
  } catch (error) {
    handleError('Start Listener', error);
  }
});

// Routes
app.get('/', (c) => {
  return c.json({ message: 'Cron job is running every 3 minutes.' });
});
app.notFound((c) => c.text('Route not found', 404));

const server = serverless(app);

server.listen(port, () => {
  Logger.info(`[Hono-Service] Server is running on port ${port}`);
});

app.fire();
