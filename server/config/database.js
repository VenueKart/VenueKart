import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

mongoose.set('bufferCommands', false);

let isConnected = false;

export function isDatabaseReady() {
  return isConnected;
}

export async function initializeDatabase() {
  const uri = process.env.MONGO_URI;
  if (!uri || !uri.startsWith('mongodb')) {
    console.warn('MONGO_URI not configured — skipping Mongo connection. Set MONGO_URI to enable DB features.');
    return;
  }
  if (isConnected) return;

  mongoose.set('strictQuery', true);

  let attempt = 0;
  const maxDelay = 30000; // cap backoff at 30s

  while (!isConnected) {
    attempt++;
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
      isConnected = true;
      console.log('MongoDB connected successfully');
      break;
    } catch (error) {
      const base = 2000 * Math.min(1 << Math.min(attempt - 1, 4), 16); // 2s..32s
      const delay = Math.min(base, maxDelay);
      const msg = (error && error.message) ? error.message : String(error);
      console.warn(`Mongo connect attempt ${attempt} failed: ${msg}. Retrying in ${Math.round(delay/1000)}s...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

export default {};
