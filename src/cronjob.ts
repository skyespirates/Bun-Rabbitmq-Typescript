import { config } from 'dotenv';
import { Hono } from 'hono';
import { Logger } from './helper/logger';
import { listeningQueue } from './listener';
import { handleCreateUser } from './listener/create-user';
import type { VercelRequest, VercelResponse } from '@vercel/node';

config();

const app = new Hono();

// Fungsi utama scheduler
async function runScheduledTask() {
  try {
    Logger.info('Starting scheduled task...');

    // Jalankan listener queue
    await listeningQueue('USER_REGISTRATION', handleCreateUser);

    Logger.info('Scheduled task completed successfully.');
    return { message: 'Scheduler Service task executed' };
  } catch (error) {
    Logger.error('Failed to run scheduled task', error);
    throw error;
  }
}

// Route untuk manual trigger
app.get('/', async (c) => {
  try {
    const result = await runScheduledTask();
    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Failed to run scheduler' }, 500);
  }
});

// Export handler untuk Vercel API Routes
export default async function handler(
  req: VercelRequest, 
  res: VercelResponse
) {
  if (req.method === 'GET') {
    try {
      const result = await runScheduledTask();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to run scheduler' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
