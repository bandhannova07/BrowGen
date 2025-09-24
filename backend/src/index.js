import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool } from './lib/pool.js';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import progressRoutes from './routes/progress.js';
import mentorRoutes from './routes/mentors.js';
import blogRoutes from './routes/blog.js';
import testimonialRoutes from './routes/testimonials.js';
import communityRoutes from './routes/community.js';

const app = express();

// Production CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' ? allowedOrigins : '*', 
  credentials: true 
}));
app.use(express.json());

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BrowGen API listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});
