import moment from 'moment';
import { createLogger, format, transports } from 'winston';
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';
import { config } from 'dotenv';
config({ path: '../.env' });

// Inisialisasi Logtail dengan API key
const LOGTAIL_API_KEY = process.env.LOGTAIL_API_KEY
if (!LOGTAIL_API_KEY) {
    throw new Error("Environment variable LOGTAIL_API_KEY is not set.");
}

const logtail = new Logtail(LOGTAIL_API_KEY);

const { combine, timestamp, printf } = format;

const loggerFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

export const Logger = createLogger({
  level: 'debug',
  format: combine(
    timestamp({ format: () => moment().format('ddd, DD MMM YYYY HH:mm:ss') }),
    loggerFormat
  ),
  transports: [
    new transports.Console(),
    new LogtailTransport(logtail),
  ],
});