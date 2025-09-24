import express from 'express';
import { pool } from '../lib/pool.js';

const router = express.Router();

router.get('/events', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM events ORDER BY event_date ASC');
  res.json(rows);
});

router.get('/links', async (req, res) => {
  res.json({ discord: 'https://discord.gg/your-server', telegram: 'https://t.me/your-channel' });
});

export default router;
