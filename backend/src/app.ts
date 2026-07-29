import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

import { env } from './config';

import routes from './routes';
import { API_PREFIX } from './config';
import { requestLoggerMiddleware, notFoundMiddleware, errorMiddleware } from './middleware';

const app = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Logging
app.use(requestLoggerMiddleware);

// Routes
app.use(API_PREFIX, routes);

// Unknown Routes
app.use(notFoundMiddleware);

// Global Error Handler
app.use(errorMiddleware);

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Ganpati Vargani API',
    version: env.API_VERSION,
  });
});

export default app;
