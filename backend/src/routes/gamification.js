import express from 'express';
import { pool } from '../lib/pool.js';
import { cache } from '../lib/redis.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Badge definitions
const BADGES = {
  first_course: { name: 'First Steps', description: 'Completed your first course', points: 50 },
  streak_7: { name: 'Week Warrior', description: '7-day learning streak', points: 100 },
  streak_30: { name: 'Month Master', description: '30-day learning streak', points: 500 },
  points_1000: { name: 'Knowledge Seeker', description: 'Earned 1000 points', points: 100 },
  points_5000: { name: 'Learning Legend', description: 'Earned 5000 points', points: 250 },
  mentor_meeting: { name: 'Mentorship Seeker', description: 'Had first mentor session', points: 75 },
  community_active: { name: 'Community Champion', description: 'Active in community discussions', points: 150 }
};

// Points system
const POINTS = {
  module_complete: 10,
  course_complete: 50,
  quiz_perfect: 25,
  daily_login: 5,
  mentor_session: 30,
  community_post: 15,
  community_comment: 5
};

// Award points to user
async function awardPoints(userId, pointType, multiplier = 1) {
  const points = POINTS[pointType] * multiplier;
  
  try {
    // Update user points
    await pool.query(`
      INSERT INTO user_points (user_id, total_points, last_activity_date) 
      VALUES ($1, $2, CURRENT_DATE)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        total_points = user_points.total_points + $2,
        last_activity_date = CURRENT_DATE
    `, [userId, points]);
    
    // Update streak
    await updateStreak(userId);
    
    // Check for new badges
    await checkAndAwardBadges(userId);
    
    // Clear leaderboard cache
    await cache.del('leaderboard:top');
    
    return points;
  } catch (error) {
    console.error('[GAMIFICATION] Award points error:', error);
    return 0;
  }
}

// Update user streak
async function updateStreak(userId) {
  try {
    const result = await pool.query(`
      SELECT current_streak, longest_streak, last_activity_date 
      FROM user_points 
      WHERE user_id = $1
    `, [userId]);
    
    if (result.rowCount === 0) return;
    
    const { current_streak, longest_streak, last_activity_date } = result.rows[0];
    const today = new Date().toDateString();
    const lastActivity = last_activity_date ? new Date(last_activity_date).toDateString() : null;
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    let newStreak = current_streak || 0;
    
    if (lastActivity === today) {
      // Already counted today
      return;
    } else if (lastActivity === yesterday) {
      // Consecutive day
      newStreak += 1;
    } else {
      // Streak broken
      newStreak = 1;
    }
    
    const newLongest = Math.max(longest_streak || 0, newStreak);
    
    await pool.query(`
      UPDATE user_points 
      SET current_streak = $1, longest_streak = $2 
      WHERE user_id = $3
    `, [newStreak, newLongest, userId]);
    
    // Check streak badges
    if (newStreak === 7) {
      await awardBadge(userId, 'streak_7');
    } else if (newStreak === 30) {
      await awardBadge(userId, 'streak_30');
    }
    
  } catch (error) {
    console.error('[GAMIFICATION] Update streak error:', error);
  }
}

// Award badge to user
async function awardBadge(userId, badgeType) {
  try {
    const badge = BADGES[badgeType];
    if (!badge) return false;
    
    // Check if user already has this badge
    const existing = await pool.query(
      'SELECT id FROM user_badges WHERE user_id = $1 AND badge_type = $2',
      [userId, badgeType]
    );
    
    if (existing.rowCount > 0) return false;
    
    // Award badge
    await pool.query(
      'INSERT INTO user_badges (user_id, badge_type, badge_name) VALUES ($1, $2, $3)',
      [userId, badgeType, badge.name]
    );
    
    // Award bonus points
    await pool.query(`
      UPDATE user_points 
      SET total_points = total_points + $1 
      WHERE user_id = $2
    `, [badge.points, userId]);
    
    console.log(`[GAMIFICATION] Badge awarded: ${badge.name} to user ${userId}`);
    return true;
    
  } catch (error) {
    console.error('[GAMIFICATION] Award badge error:', error);
    return false;
  }
}

// Check and award badges based on current stats
async function checkAndAwardBadges(userId) {
  try {
    const stats = await pool.query(`
      SELECT 
        up.total_points,
        up.current_streak,
        (SELECT COUNT(*) FROM progress WHERE user_id = $1 AND completed = true) as completed_courses
      FROM user_points up 
      WHERE up.user_id = $1
    `, [userId]);
    
    if (stats.rowCount === 0) return;
    
    const { total_points, current_streak, completed_courses } = stats.rows[0];
    
    // Points-based badges
    if (total_points >= 1000) await awardBadge(userId, 'points_1000');
    if (total_points >= 5000) await awardBadge(userId, 'points_5000');
    
    // Course completion badges
    if (completed_courses >= 1) await awardBadge(userId, 'first_course');
    
  } catch (error) {
    console.error('[GAMIFICATION] Check badges error:', error);
  }
}

// API Routes

// Award points (called by other services)
router.post('/award-points', requireAuth, async (req, res) => {
  const { pointType, multiplier = 1 } = req.body;
  const userId = req.user.id;
  
  if (!POINTS[pointType]) {
    return res.status(400).json({ error: 'Invalid point type' });
  }
  
  try {
    const pointsAwarded = await awardPoints(userId, pointType, multiplier);
    res.json({ success: true, points: pointsAwarded });
  } catch (error) {
    console.error('[GAMIFICATION] Award points API error:', error);
    res.status(500).json({ error: 'Failed to award points' });
  }
});

// Get user stats
router.get('/stats', requireAuth, async (req, res) => {
  const userId = req.user.id;
  
  try {
    const stats = await pool.query(`
      SELECT 
        up.total_points,
        up.current_streak,
        up.longest_streak,
        up.last_activity_date,
        (SELECT COUNT(*) FROM user_badges WHERE user_id = $1) as badge_count,
        (SELECT json_agg(json_build_object('type', badge_type, 'name', badge_name, 'earned_at', earned_at)) 
         FROM user_badges WHERE user_id = $1) as badges
      FROM user_points up 
      WHERE up.user_id = $1
    `, [userId]);
    
    if (stats.rowCount === 0) {
      // Initialize user points
      await pool.query(
        'INSERT INTO user_points (user_id, total_points) VALUES ($1, 0)',
        [userId]
      );
      
      return res.json({
        total_points: 0,
        current_streak: 0,
        longest_streak: 0,
        badge_count: 0,
        badges: []
      });
    }
    
    res.json(stats.rows[0]);
    
  } catch (error) {
    console.error('[GAMIFICATION] Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  const { limit = 10, offset = 0 } = req.query;
  
  try {
    // Try cache first
    const cacheKey = `leaderboard:top:${limit}:${offset}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    const result = await pool.query(`
      SELECT 
        u.name,
        u.id,
        up.total_points,
        up.current_streak,
        (SELECT COUNT(*) FROM user_badges WHERE user_id = u.id) as badge_count,
        ROW_NUMBER() OVER (ORDER BY up.total_points DESC) as rank
      FROM users u
      JOIN user_points up ON u.id = up.user_id
      ORDER BY up.total_points DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    const leaderboard = result.rows;
    
    // Cache for 5 minutes
    await cache.set(cacheKey, leaderboard, 300);
    
    res.json(leaderboard);
    
  } catch (error) {
    console.error('[GAMIFICATION] Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Get available badges
router.get('/badges', async (req, res) => {
  res.json(BADGES);
});

export default router;
export { awardPoints, awardBadge, POINTS };
