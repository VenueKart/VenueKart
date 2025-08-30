import { createServer } from './index.js';
import dotenv from 'dotenv';

dotenv.config();

const app = createServer();
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});
