import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { pool } from '../lib/pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const schemaPath = resolve(__dirname, '../../../database/schema.sql');
  const sql = readFileSync(schemaPath, 'utf8');
  console.log('Running migrations...');
  await pool.query(sql);
  console.log('Migrations completed.');
  await pool.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
