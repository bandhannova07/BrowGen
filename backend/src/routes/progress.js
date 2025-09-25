import express from 'express';
import { pool } from '../lib/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { awardPoints } from './gamification.js';
import { triggerBro } from '../lib/bro-triggers.js';

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
    // Get previous progress
    const prevProgress = await pool.query(
      'SELECT completed_modules, total_modules FROM progress WHERE user_id = $1 AND course_id = $2',
      [userId, course_id]
    );
    
    const prevCompleted = prevProgress.rowCount > 0 ? prevProgress.rows[0].completed_modules : 0;
    const prevTotal = prevProgress.rowCount > 0 ? prevProgress.rows[0].total_modules : 0;
    
    // Update progress
    const { rows } = await pool.query(
      `INSERT INTO progress (user_id, course_id, completed_modules, total_modules, points, badges)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (user_id, course_id)
       DO UPDATE SET completed_modules=EXCLUDED.completed_modules, total_modules=EXCLUDED.total_modules, points=EXCLUDED.points, badges=EXCLUDED.badges
       RETURNING *`,
      [userId, course_id, completed_modules ?? 0, total_modules ?? 0, points ?? 0, badges ?? []]
    );
    
    const newProgress = rows[0];
    
    // Award points for new modules completed
    const newModulesCompleted = (completed_modules || 0) - prevCompleted;
    if (newModulesCompleted > 0) {
      await awardPoints(userId, 'module_complete', newModulesCompleted);
      
      // Trigger Bro for module completion
      triggerBro(userId, 'module_complete', {
        course_id,
        modules_completed: newModulesCompleted,
        total_completed: completed_modules
      });
    }
    
    // Check if course is completed
    const wasCompleted = prevCompleted === prevTotal && prevTotal > 0;
    const isNowCompleted = completed_modules === total_modules && total_modules > 0;
    
    if (!wasCompleted && isNowCompleted) {
      await awardPoints(userId, 'course_complete');
      
      // Trigger Bro for course completion
      triggerBro(userId, 'course_complete', {
        course_id,
        total_modules: total_modules
      });
    }
    
    res.json(newProgress);
    
  } catch (e) {
    console.error('[PROGRESS ERROR]', e);
    res.status(400).json({ error: 'Could not update progress' });
  }
});

// Complete a specific module
router.post('/module/:moduleId/complete', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { moduleId } = req.params;
  
  try {
    // Get module info
    const moduleResult = await pool.query(
      'SELECT course_id FROM modules WHERE id = $1',
      [moduleId]
    );
    
    if (moduleResult.rowCount === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    const courseId = moduleResult.rows[0].course_id;
    
    // Get current progress
    const progressResult = await pool.query(
      'SELECT completed_modules, total_modules FROM progress WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );
    
    let completedModules = 0;
    let totalModules = 0;
    
    if (progressResult.rowCount > 0) {
      completedModules = progressResult.rows[0].completed_modules;
      totalModules = progressResult.rows[0].total_modules;
    } else {
      // Get total modules for this course
      const totalResult = await pool.query(
        'SELECT COUNT(*) as count FROM modules WHERE course_id = $1',
        [courseId]
      );
      totalModules = parseInt(totalResult.rows[0].count);
    }
    
    // Increment completed modules
    completedModules += 1;
    
    // Update progress
    await pool.query(
      `INSERT INTO progress (user_id, course_id, completed_modules, total_modules)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, course_id)
       DO UPDATE SET completed_modules = EXCLUDED.completed_modules`,
      [userId, courseId, completedModules, totalModules]
    );
    
    // Award points
    await awardPoints(userId, 'module_complete');
    
    // Trigger Bro
    triggerBro(userId, 'module_complete', {
      course_id: courseId,
      module_id: moduleId,
      completed_modules: completedModules,
      total_modules: totalModules
    });
    
    // Check if course is now complete
    if (completedModules === totalModules) {
      await awardPoints(userId, 'course_complete');
      triggerBro(userId, 'course_complete', {
        course_id: courseId,
        total_modules: totalModules
      });
    }
    
    res.json({
      success: true,
      completed_modules: completedModules,
      total_modules: totalModules,
      course_complete: completedModules === totalModules
    });
    
  } catch (error) {
    console.error('[MODULE COMPLETE ERROR]', error);
    res.status(500).json({ error: 'Failed to complete module' });
  }
});

export default router;
