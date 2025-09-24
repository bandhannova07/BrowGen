import express from 'express';
import { pool } from '../lib/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { rows } = await pool.query(
    `SELECT p.*, c.title as course_title FROM progress p
     JOIN courses c ON c.id = p.course_id
     WHERE p.user_id=$1 ORDER BY c.created_at DESC`,
    [userId]
  );
  res.json(rows);
});

router.post('/', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { course_id, completed_modules, total_modules, points, badges } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO progress (user_id, course_id, completed_modules, total_modules, points, badges)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (user_id, course_id)
       DO UPDATE SET completed_modules=EXCLUDED.completed_modules, total_modules=EXCLUDED.total_modules, points=EXCLUDED.points, badges=EXCLUDED.badges
       RETURNING *`,
      [userId, course_id, completed_modules ?? 0, total_modules ?? 0, points ?? 0, badges ?? []]
    );
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'Could not update progress' });
  }
});

export default router;
