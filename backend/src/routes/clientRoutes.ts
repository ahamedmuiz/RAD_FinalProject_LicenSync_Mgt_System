import express from 'express';
import { createClient, getClients } from '../controllers/clientController';
import { protect, projectManagerOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Apply the security middleware to all routes in this file
router.use(protect);
router.use(projectManagerOnly);

// Map the routes
router.route('/')
  .post(createClient)
  .get(getClients);

export default router;