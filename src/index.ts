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
    throw error;
  }
}

app.get('/', (c) => {
  return c.json({ 
    message: 'Service is running', 
    timestamp: new Date().toISOString() 
  });
});

// Queue management route
app.get('/queue', async (c) => {
  try {
    Logger.info('Manually triggering queue listener...');

    // If listeningQueue doesn't return a value, just await it
    await listeningQueue('USER_REGISTRATION', handleCreateUser);
    
    return c.json({ 
      message: 'USER_REGISTRATION queue processing initiated',
      processed: true 
    });
  } catch (error) {
    Logger.error('Queue processing failed:', error);
    return c.json({ 
      message: 'Queue processing failed', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// 404 handler
app.notFound((c) => c.json({ 
  message: 'Route not found', 
  status: 404 
}, 404));

// Error handler
app.onError((error, c) => {
  Logger.error('Unhandled application error:', error);
  return c.json({ 
    message: 'Internal server error', 
    error: error instanceof Error ? error.message : 'Unknown error' 
  }, 500);
});

// Create serverless app
const server = serverless(app);

// Server startup with listener
async function startServer() {
  try {
    // Start the listener
    await startListener();

    // Start the server
    server.listen(port, () => {
      Logger.info(`[Hono-Service] Server is running on port ${port}`);
    });
  } catch (error) {
    Logger.error('Failed to start server and listener:', error);
    process.exit(1);
  }
}

// Initiate server startup
startServer();