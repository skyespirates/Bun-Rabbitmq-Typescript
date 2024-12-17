import { config } from 'dotenv';
import { Hono } from 'hono';
import { Logger } from './helper/logger';
import { ErrorHandler } from './helper/error-handler';
import { httpLogger } from './helper/http-logger';
import { serverless } from './helper';

config();

const app = new Hono();
const port = process.env.PORT || 8989;

app.get('/', (c) => {
  return c.json({ message: 'Cron job is running every 3 minutes.' });
});
app.onError(ErrorHandler);
app.notFound((c) => c.text('Route not found', 404));

const server = serverless(app);

server.listen(port, () => {
  Logger.info(`[Hono-Service] Server is running on port ${port}`);
});
