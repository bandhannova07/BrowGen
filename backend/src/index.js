import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { pool } from './lib/pool.js';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import progressRoutes from './routes/progress.js';
import mentorRoutes from './routes/mentors.js';
import blogRoutes from './routes/blog.js';
import testimonialRoutes from './routes/testimonials.js';
import communityRoutes from './routes/community.js';
import broRoutes from './routes/bro.js';
import gamificationRoutes from './routes/gamification.js';
import adminRoutes from './routes/admin.js';
import { analyticsMiddleware } from './lib/analytics.js';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
}));

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Production CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' ? allowedOrigins : '*', 
  credentials: true 
}));
app.use(express.json());

// Analytics middleware
app.use(analyticsMiddleware);

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, service: 'browgen-backend' });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'DB not reachable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/bro', broRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BrowGen API listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});
