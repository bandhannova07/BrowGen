import express from 'express';
import { pool } from '../lib/pool.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT id, title, slug, excerpt, category, created_at FROM blog_posts ORDER BY created_at DESC');
  res.json(rows);
});

router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  const { rows } = await pool.query('SELECT * FROM blog_posts WHERE slug=$1', [slug]);
  if (rows.length === 0) return res.status(404).json({ error: 'Post not found' });
  res.json(rows[0]);
});

export default router;
