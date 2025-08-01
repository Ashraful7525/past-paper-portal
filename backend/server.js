import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with explicit path
const envResult = dotenv.config({ path: path.join(__dirname, '.env') });

// Enhanced Debug environment loading
console.log('🔍 Backend Environment Variables Debug:');
console.log('🔧 Environment loading result:', envResult.error ? `❌ ${envResult.error.message}` : '✅ Success');
console.log('🔧 Current working directory:', process.cwd());
console.log('🔧 Server file directory:', __dirname);
console.log('🔧 .env file path:', path.join(__dirname, '.env'));

// Check all required environment variables
console.log('🔧 Environment variables status:');
console.log('  NODE_ENV:', process.env.NODE_ENV || '❌ Missing (defaulting to development)');
console.log('  PORT:', process.env.PORT || '❌ Missing (defaulting to 3000)');
console.log('  SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Loaded' : '❌ Missing');
console.log('  SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Loaded' : '❌ Missing');
console.log('  SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Loaded' : '❌ Missing');
console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '✅ Loaded' : '❌ Missing');
console.log('  FRONTEND_URL:', process.env.FRONTEND_URL || '❌ Missing (defaulting to http://localhost:5173)');
console.log('  GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Loaded' : '❌ Missing');

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import postsRoutes from './routes/posts.js';
import solutionsRoutes from './routes/solutions.js';
import commentsRoutes from './routes/comments.js';
import coursesRoutes from './routes/courses.js';
import adminRoutes from './routes/admin.js';
import reportsRoutes from './routes/reports.js';
import { testConnection } from './config/db.js'; // FIXED: Added config/ path

const app = express();
const PORT = process.env.PORT || 3000;

// Test database connection on startup
testConnection();

// Middleware
app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Infinity, // Relaxed for development
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', limiter);

// Registration-specific rate limiting
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Infinity, // Relaxed for development
  message: {
    error: 'Too many registration attempts from this IP, please try again later.'
  },
});

// Login-specific rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Infinity, // Relaxed for development
  message: {
    error: 'Too many login attempts from this IP, please try again later.'
  },
});

// Apply specific rate limiting to auth endpoints
app.use('/api/auth/register', registrationLimiter);
app.use('/api/auth/login', loginLimiter);

// --- API ROUTES ---
// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root API info
app.get('/', (req, res) => {
  res.json({
    message: 'Past Paper Portal API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      posts: '/api/posts',
      solutions: '/api/solutions',
      comments: '/api/comments',
      courses: '/api/courses',
      admin: '/api/admin',
      reports: '/api/reports',
      health: '/health'
    }
  });
});

// Mount routers under /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/solutions', solutionsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportsRoutes);

// --- ERROR HANDLING ---
// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation error', details: err.message });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
  });
});

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`📝 Posts endpoints: http://localhost:${PORT}/api/posts`);
  console.log(`💡 Solutions endpoints: http://localhost:${PORT}/api/solutions`);
  console.log(`💬 Comments endpoints: http://localhost:${PORT}/api/comments`);
  console.log(`👨‍💼 Admin endpoints: http://localhost:${PORT}/api/admin`);
});
