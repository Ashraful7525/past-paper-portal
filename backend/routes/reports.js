import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import reportsController from '../controllers/reportsController.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// User routes for reporting content
router.post('/', reportsController.submitReport);
router.get('/:contentType/:contentId', reportsController.getReportsByContent);
router.get('/check/:contentType/:contentId', reportsController.checkUserReport);

export default router;
