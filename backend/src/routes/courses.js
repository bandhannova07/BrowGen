import express from 'express';
import { pool } from '../lib/pool.js';
import { cache } from '../lib/redis.js';

const router = express.Router();

// Cache middleware
function cacheMiddleware(ttlSeconds = 300) {
  return async (req, res, next) => {
    const cacheKey = `courses:${req.originalUrl}`;
    
    try {
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        res.set('X-Cache', 'HIT');
        return res.json(cachedData);
      }
      
      // Store original json method
      const originalJson = res.json;
      
      // Override json method to cache response
      res.json = function(data) {
        res.set('X-Cache', 'MISS');
        cache.set(cacheKey, data, ttlSeconds);
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('[CACHE MIDDLEWARE ERROR]', error);
      next();
    }
  };
}

router.get('/', cacheMiddleware(300), async (req, res) => {
  const { q, category, level } = req.query;
  const conditions = [];
  const values = [];
  if (q) { values.push(`%${q}%`); conditions.push(`(title ILIKE $${values.length} OR description ILIKE $${values.length})`); }
  if (category) { values.push(category); conditions.push(`category_id = (SELECT id FROM categories WHERE slug=$${values.length})`); }
  if (level) { values.push(level); conditions.push(`level = $${values.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `SELECT c.*, (SELECT COUNT(*) FROM modules m WHERE m.course_id=c.id) AS module_count FROM courses c ${where} ORDER BY created_at DESC`;
  const result = await pool.query(sql, values);
  res.json(result.rows);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM courses WHERE id=$1', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Course not found' });
  res.json(rows[0]);
});

router.get('/:id/modules', async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM modules WHERE course_id=$1 ORDER BY order_index ASC', [id]);
  res.json(rows);
});

export default router;
