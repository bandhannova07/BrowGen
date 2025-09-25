import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { randomBytes } from 'crypto';
import { pool } from '../lib/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../lib/email.js';

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many auth attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 login attempts per windowMs
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Enhanced logging function
function logAuthEvent(event, email, ip, userAgent, success = true, error = null) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    event,
    email: email ? email.substring(0, 3) + '***' : null, // Partial email for privacy
    ip,
    userAgent,
    success,
    error: error ? error.message : null
  };
  console.log(`[AUTH] ${JSON.stringify(logData)}`);
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).optional(),
});

router.post('/signup', authLimiter, async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    logAuthEvent('signup_validation_failed', req.body.email, ip, userAgent, false, new Error('Validation failed'));
    return res.status(400).json({ error: 'Invalid input data' });
  }
  
  const { email, password, name = 'Learner' } = parsed.data;
  
  try {
    // Check if user already exists
    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rowCount > 0) {
      logAuthEvent('signup_duplicate_email', email, ip, userAgent, false, new Error('Email already registered'));
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    // Hash password with higher rounds for production
    const saltRounds = process.env.NODE_ENV === 'production' ? 12 : 10;
    const hash = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, created_at) VALUES ($1,$2,$3,NOW()) RETURNING id, email, name, created_at',
      [email, hash, name]
    );
    
    const user = result.rows[0];
    
    // Generate JWT tokens - refresh (7d) and access (15min)
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Set httpOnly cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    logAuthEvent('signup_success', email, ip, userAgent, true);
    
    // Send welcome email (async, don't wait)
    sendWelcomeEmail(user.email, user.name).catch(error => {
      console.error('[AUTH] Welcome email failed:', error);
    });
    
    res.status(201).json({ accessToken, user: { id: user.id, email: user.email, name: user.name } });
    
  } catch (e) {
    logAuthEvent('signup_error', email, ip, userAgent, false, e);
    console.error('[AUTH ERROR]', e);
    res.status(500).json({ error: 'Signup failed' });
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    logAuthEvent('login_validation_failed', req.body.email, ip, userAgent, false, new Error('Validation failed'));
    return res.status(400).json({ error: 'Invalid input data' });
  }
  
  const { email, password } = parsed.data;
  
  try {
    const result = await pool.query('SELECT id, email, name, password_hash FROM users WHERE email=$1', [email]);
    
    if (result.rowCount === 0) {
      logAuthEvent('login_user_not_found', email, ip, userAgent, false, new Error('User not found'));
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Use constant-time comparison
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      logAuthEvent('login_invalid_password', email, ip, userAgent, false, new Error('Invalid password'));
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
    
    // Generate JWT tokens - refresh (7d) and access (15min)
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Set httpOnly cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    analytics.track(user.id, EVENTS.USER_LOGGED_IN, {
      method: 'email',
      user_agent: req.get('User-Agent'),
      ip: req.ip
    });

    logAuthEvent('login_success', email, ip, userAgent, true);
    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
    
  } catch (e) {
    logAuthEvent('login_error', email, ip, userAgent, false, e);
    console.error('[AUTH ERROR]', e);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Refresh access token using httpOnly cookie
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }
    
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid token type' });
    }
    
    // Generate new access token
    const accessToken = jwt.sign(
      { id: decoded.id, email: decoded.email, name: decoded.name, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    res.json({ accessToken });
    
  } catch (error) {
    console.error('[REFRESH ERROR]', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout - clear refresh cookie
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

// Password reset request
router.post('/password/reset-request', authLimiter, async (req, res) => {
  const { email } = req.body;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  
  if (!email || !z.string().email().safeParse(email).success) {
    logAuthEvent('reset_request_invalid_email', email, ip, userAgent, false, new Error('Invalid email'));
    return res.status(400).json({ error: 'Valid email required' });
  }
  
  try {
    // Check if user exists
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    // Always return success to prevent email enumeration
    if (userResult.rowCount === 0) {
      logAuthEvent('reset_request_user_not_found', email, ip, userAgent, false, new Error('User not found'));
      return res.json({ ok: true, message: 'If the email exists, a reset link has been sent' });
    }
    
    const userId = userResult.rows[0].id;
    
    // Generate secure reset token
    const resetToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Store reset token in database
    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (user_id) DO UPDATE SET token = $2, expires_at = $3, created_at = NOW()',
      [userId, resetToken, expiresAt]
    );
    
    logAuthEvent('reset_request_success', email, ip, userAgent, true);
    
    // Get user name for email
    const userInfo = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
    const userName = userInfo.rows[0]?.name || 'User';
    
    // Send password reset email (async, don't wait)
    sendPasswordResetEmail(email, userName, resetToken).catch(error => {
      console.error('[AUTH] Password reset email failed:', error);
    });
    
    // In development, also log the token
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Password reset token for ${email}: ${resetToken}`);
    }
    
    res.json({ ok: true, message: 'If the email exists, a reset link has been sent' });
    
  } catch (e) {
    logAuthEvent('reset_request_error', email, ip, userAgent, false, e);
    console.error('[AUTH ERROR]', e);
    res.status(500).json({ error: 'Reset request failed' });
  }
});

// Password reset confirmation
router.post('/password/reset', authLimiter, async (req, res) => {
  const { token, newPassword } = req.body;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  
  if (!token || !newPassword || newPassword.length < 6) {
    logAuthEvent('reset_confirm_invalid_input', null, ip, userAgent, false, new Error('Invalid input'));
    return res.status(400).json({ error: 'Valid token and password (min 6 chars) required' });
  }
  
  try {
    // Find valid reset token
    const tokenResult = await pool.query(
      'SELECT user_id, expires_at FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    
    if (tokenResult.rowCount === 0) {
      logAuthEvent('reset_confirm_invalid_token', null, ip, userAgent, false, new Error('Invalid or expired token'));
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    const { user_id } = tokenResult.rows[0];
    
    // Hash new password
    const saltRounds = process.env.NODE_ENV === 'production' ? 12 : 10;
    const hash = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password and delete reset token
    await pool.query('BEGIN');
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, user_id]);
    await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user_id]);
    await pool.query('COMMIT');
    
    logAuthEvent('reset_confirm_success', null, ip, userAgent, true);
    res.json({ ok: true, message: 'Password reset successful' });
    
  } catch (e) {
    await pool.query('ROLLBACK');
    logAuthEvent('reset_confirm_error', null, ip, userAgent, false, e);
    console.error('[AUTH ERROR]', e);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

export default router;
