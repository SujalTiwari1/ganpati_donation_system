const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer to be inside the project folder
  // so it persists from Render's build environment to the runtime environment.
  cacheDirectory: join(__dirname, '.puppeteercache'),
};
