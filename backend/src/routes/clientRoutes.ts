import express from 'express';
import { createClient, getClients, updateClient, deleteClient } from '../controllers/clientController';
import { protect, projectManagerOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);
router.use(projectManagerOnly);

router.route('/')
  .post(createClient)
  .get(getClients);

router.route('/:id')
  .put(updateClient)
  .delete(deleteClient);

export default router;