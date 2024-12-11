import { Hono } from 'hono';
import { handleError } from './helper/eror-handling';
import { listeningQueue } from './listener';
import { handleCreateUser } from './listener/create-user';
import schedule from 'node-schedule';
import { Logger } from './helper/logger';

const app = new Hono();

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

app.fire();
