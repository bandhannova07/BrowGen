import express from 'express';
import { pool } from '../lib/pool.js';
import { cache } from '../lib/redis.js';
import { requireAuth } from '../middleware/auth.js';
import { analytics, EVENTS } from '../lib/analytics.js';

const router = express.Router();

// Admin middleware
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Apply auth and admin middleware to all routes
router.use(requireAuth);
router.use(requireAdmin);

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days') as new_users_30d,
        (SELECT COUNT(*) FROM courses) as total_courses,
        (SELECT COUNT(*) FROM progress WHERE completed_modules > 0) as active_learners,
        (SELECT COUNT(*) FROM user_badges) as total_badges_earned,
        (SELECT SUM(total_points) FROM user_points) as total_points_awarded,
        (SELECT COUNT(*) FROM mentors) as total_mentors,
        (SELECT COUNT(*) FROM blog_posts) as total_blog_posts
    `);
    
    const recentActivity = await pool.query(`
      SELECT 
        'signup' as type, 
        u.name as user_name, 
        u.email as user_email,
        u.created_at as timestamp
      FROM users u 
      WHERE u.created_at > NOW() - INTERVAL '7 days'
      UNION ALL
      SELECT 
        'course_progress' as type,
        u.name as user_name,
        c.title as course_title,
        p.updated_at as timestamp
      FROM progress p
      JOIN users u ON u.id = p.user_id
      JOIN courses c ON c.id = p.course_id
      WHERE p.updated_at > NOW() - INTERVAL '7 days'
      ORDER BY timestamp DESC
      LIMIT 20
    `);
    
    analytics.track(req.user.id, EVENTS.PAGE_VIEWED, { page: 'admin_dashboard' });
    
    res.json({
      stats: stats.rows[0],
      recent_activity: recentActivity.rows
    });
    
  } catch (error) {
    console.error('[ADMIN] Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// User management
router.get('/users', async (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  const offset = (page - 1) * limit;
  
  try {
    let whereClause = '';
    let params = [limit, offset];
    
    if (search) {
      whereClause = 'WHERE u.name ILIKE $3 OR u.email ILIKE $3';
      params.push(`%${search}%`);
    }
    
    const users = await pool.query(`
      SELECT 
        u.id, u.name, u.email, u.role, u.created_at, u.last_login,
        up.total_points,
        (SELECT COUNT(*) FROM user_badges WHERE user_id = u.id) as badge_count,
        (SELECT COUNT(*) FROM progress WHERE user_id = u.id AND completed_modules > 0) as courses_started
      FROM users u
      LEFT JOIN user_points up ON up.user_id = u.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2
    `, params);
    
    const totalResult = await pool.query(`
      SELECT COUNT(*) as total FROM users u ${whereClause}
    `, search ? [`%${search}%`] : []);
    
    res.json({
      users: users.rows,
      total: parseInt(totalResult.rows[0].total),
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
  } catch (error) {
    console.error('[ADMIN] Users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Update user role
router.patch('/users/:userId/role', async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  
  if (!['user', 'admin', 'mentor'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  
  try {
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, userId]);
    
    analytics.track(req.user.id, 'admin_user_role_updated', {
      target_user_id: userId,
      new_role: role
    });
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('[ADMIN] Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Course management
router.get('/courses', async (req, res) => {
  try {
    const courses = await pool.query(`
      SELECT 
        c.*,
        cat.name as category_name,
        (SELECT COUNT(*) FROM modules WHERE course_id = c.id) as module_count,
        (SELECT COUNT(*) FROM progress WHERE course_id = c.id) as enrolled_count
      FROM courses c
      LEFT JOIN categories cat ON cat.id = c.category_id
      ORDER BY c.created_at DESC
    `);
    
    res.json(courses.rows);
    
  } catch (error) {
    console.error('[ADMIN] Courses error:', error);
    res.status(500).json({ error: 'Failed to get courses' });
  }
});

// Create course
router.post('/courses', async (req, res) => {
  const { title, description, category_id, level = 'beginner' } = req.body;
  
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description required' });
  }
  
  try {
    const result = await pool.query(`
      INSERT INTO courses (title, description, category_id, level)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [title, description, category_id, level]);
    
    // Clear courses cache
    await cache.del('courses:*');
    
    analytics.track(req.user.id, 'admin_course_created', {
      course_id: result.rows[0].id,
      title
    });
    
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    console.error('[ADMIN] Create course error:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Update course
router.patch('/courses/:courseId', async (req, res) => {
  const { courseId } = req.params;
  const { title, description, category_id, level } = req.body;
  
  try {
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (title) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (category_id) {
      updates.push(`category_id = $${paramCount++}`);
      values.push(category_id);
    }
    if (level) {
      updates.push(`level = $${paramCount++}`);
      values.push(level);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }
    
    values.push(courseId);
    
    const result = await pool.query(`
      UPDATE courses 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `, values);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Clear courses cache
    await cache.del('courses:*');
    
    analytics.track(req.user.id, 'admin_course_updated', {
      course_id: courseId,
      updates: Object.keys(req.body)
    });
    
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('[ADMIN] Update course error:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Delete course
router.delete('/courses/:courseId', async (req, res) => {
  const { courseId } = req.params;
  
  try {
    const result = await pool.query('DELETE FROM courses WHERE id = $1', [courseId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Clear courses cache
    await cache.del('courses:*');
    
    analytics.track(req.user.id, 'admin_course_deleted', {
      course_id: courseId
    });
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('[ADMIN] Delete course error:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// Categories management
router.get('/categories', async (req, res) => {
  try {
    const categories = await pool.query(`
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM courses WHERE category_id = c.id) as course_count
      FROM categories c
      ORDER BY c.name
    `);
    
    res.json(categories.rows);
    
  } catch (error) {
    console.error('[ADMIN] Categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// Create category
router.post('/categories', async (req, res) => {
  const { name, slug } = req.body;
  
  if (!name || !slug) {
    return res.status(400).json({ error: 'Name and slug required' });
  }
  
  try {
    const result = await pool.query(`
      INSERT INTO categories (name, slug)
      VALUES ($1, $2)
      RETURNING *
    `, [name, slug]);
    
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Category slug already exists' });
    }
    console.error('[ADMIN] Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Blog management
router.get('/blog', async (req, res) => {
  try {
    const posts = await pool.query(`
      SELECT 
        bp.*,
        u.name as author_name
      FROM blog_posts bp
      LEFT JOIN users u ON u.id = bp.author_id
      ORDER BY bp.created_at DESC
    `);
    
    res.json(posts.rows);
    
  } catch (error) {
    console.error('[ADMIN] Blog error:', error);
    res.status(500).json({ error: 'Failed to get blog posts' });
  }
});

// Create blog post
router.post('/blog', async (req, res) => {
  const { title, content, excerpt, slug, published = false } = req.body;
  
  if (!title || !content || !slug) {
    return res.status(400).json({ error: 'Title, content, and slug required' });
  }
  
  try {
    const result = await pool.query(`
      INSERT INTO blog_posts (title, content, excerpt, slug, author_id, published)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title, content, excerpt, slug, req.user.id, published]);
    
    analytics.track(req.user.id, 'admin_blog_post_created', {
      post_id: result.rows[0].id,
      title,
      published
    });
    
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Blog post slug already exists' });
    }
    console.error('[ADMIN] Create blog post error:', error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

// Mentor management
router.get('/mentors', async (req, res) => {
  try {
    const mentors = await pool.query(`
      SELECT 
        m.*,
        u.name, u.email,
        (SELECT COUNT(*) FROM mentor_bookings WHERE mentor_id = m.id) as total_bookings
      FROM mentors m
      JOIN users u ON u.id = m.user_id
      ORDER BY m.created_at DESC
    `);
    
    res.json(mentors.rows);
    
  } catch (error) {
    console.error('[ADMIN] Mentors error:', error);
    res.status(500).json({ error: 'Failed to get mentors' });
  }
});

// Analytics data
router.get('/analytics', async (req, res) => {
  const { period = '30d' } = req.query;
  
  let interval = '30 days';
  if (period === '7d') interval = '7 days';
  if (period === '90d') interval = '90 days';
  
  try {
    const userGrowth = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users
      FROM users 
      WHERE created_at > NOW() - INTERVAL '${interval}'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);
    
    const courseProgress = await pool.query(`
      SELECT 
        c.title,
        COUNT(p.user_id) as enrolled_users,
        AVG(p.completed_modules::float / NULLIF(p.total_modules, 0) * 100) as avg_completion
      FROM courses c
      LEFT JOIN progress p ON p.course_id = c.id
      GROUP BY c.id, c.title
      ORDER BY enrolled_users DESC
      LIMIT 10
    `);
    
    res.json({
      user_growth: userGrowth.rows,
      course_progress: courseProgress.rows
    });
    
  } catch (error) {
    console.error('[ADMIN] Analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

export default router;
