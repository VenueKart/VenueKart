import { createServer } from './index.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env'), override: true });

const app = createServer();
const requestedPort = process.argv[2] ? parseInt(process.argv[2], 10) : undefined;
const port = requestedPort || process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.log(`Port ${port} is already in use. Assuming server is already running. Skipping start.`);
    process.exit(0);
  }
  throw err;
});
