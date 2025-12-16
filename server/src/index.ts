import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';
import https from 'https';

import { authRoutes } from './routes/auth.js';
import { articleRoutes } from './routes/articles.js';
import { categoryRoutes } from './routes/categories.js';
import { searchRoutes } from './routes/search.js';
import { adminRoutes } from './routes/admin.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later.' }
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Keep-alive ping for Render free tier
if (process.env.NODE_ENV === 'production' && process.env.APP_URL) {
  cron.schedule('*/14 * * * *', () => {
    https.get(`${process.env.APP_URL}/api/health`, (res) => {
      console.log(`Keep-alive ping: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error('Keep-alive ping failed:', err.message);
    });
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
