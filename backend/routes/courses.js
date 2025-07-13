console.log('✅ courses.js routes loaded');

import express from 'express';
import coursesController from '../controllers/coursesController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', coursesController.getCourses);
router.get('/departments/:department_id', coursesController.getCoursesByDepartment);

// Protected routes (require authentication)
router.get('/my-enrollments', authMiddleware, coursesController.getMyEnrollments);
router.post('/enroll', authMiddleware, coursesController.enrollInCourse);
router.delete('/enroll/:enrollment_id', authMiddleware, coursesController.dropCourse);

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error('Courses router error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.errors
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format'
    });
  }
  
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

export default router;
