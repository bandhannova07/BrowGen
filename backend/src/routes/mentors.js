import express from 'express';
import { pool } from '../lib/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM mentors ORDER BY name ASC');
  res.json(rows);
});

router.post('/book', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { mentor_id, scheduled_at } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO bookings (user_id, mentor_id, scheduled_at, status) VALUES ($1,$2,$3,$4) RETURNING *',
      [userId, mentor_id, scheduled_at, 'pending']
    );
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'Could not book session' });
  }
});

export default router;
