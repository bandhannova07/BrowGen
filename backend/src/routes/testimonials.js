import express from 'express';
import { pool } from '../lib/pool.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM testimonials ORDER BY created_at DESC');
  res.json(rows);
});

export default router;
