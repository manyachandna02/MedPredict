// src/utils/logger.js
import { createLogger, format, transports } from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir   = path.join(__dirname, '../../logs');

const { combine, timestamp, printf, colorize, errors, json } = format;

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) =>
    stack
      ? `${timestamp} [${level}] ${message}\n${stack}`
      : `${timestamp} [${level}] ${message}`,
  ),
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json(),
);

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    new transports.Console(),
    new transports.File({
      filename: path.join(logsDir, 'error.log'),
      level:    'error',
      format:   combine(timestamp(), errors({ stack: true }), json()),
    }),
    new transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format:   combine(timestamp(), json()),
    }),
  ],
  exceptionHandlers: [
    new transports.File({ filename: path.join(logsDir, 'exceptions.log') }),
  ],
  rejectionHandlers: [
    new transports.File({ filename: path.join(logsDir, 'rejections.log') }),
  ],
});

export default logger;
