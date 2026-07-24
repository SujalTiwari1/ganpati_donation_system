import app from "./app";

import { env, logger } from "./config";

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
});

/*
|--------------------------------------------------------------------------
| Graceful Shutdown
|--------------------------------------------------------------------------
*/

const shutdown = () => {
  logger.info("Shutting down server...");

  server.close(() => {
    logger.info("Server stopped.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);