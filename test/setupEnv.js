import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.test');

// Load .env.test file explicitly
const result = config({ path: envPath });

if (result.error) console.error('Error loading .env.test file:', result.error);
