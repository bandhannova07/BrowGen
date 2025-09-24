import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { pool } from '../lib/pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const seedPath = resolve(__dirname, '../../../database/seed.sql');
  const sql = readFileSync(seedPath, 'utf8');
  console.log('Running seed...');
  await pool.query(sql);
  console.log('Seed completed.');
  await pool.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
