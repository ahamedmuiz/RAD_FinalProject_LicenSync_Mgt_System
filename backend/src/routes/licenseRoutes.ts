import express from 'express';
import { createLicense, getLicenses, updateLicense, deleteLicense,generateRFQ, consumeSeat } from '../controllers/licenseController';
import { protect, projectManagerOnly } from '../middleware/authMiddleware';

const router = express.Router();

// ALL routes in this file require the user to be logged in
router.use(protect);

// GET is accessible by both PMs and Clients. POST is restricted to PMs.
router.route('/')
  .get(getLicenses)
  .post(projectManagerOnly, createLicense);

// PUT and DELETE require a specific ID and are restricted to PMs.
router.route('/:id')
  .put(projectManagerOnly, updateLicense)
  .delete(projectManagerOnly, deleteLicense);


  // GET is accessible by both PMs and Clients so they can download the quote
router.route('/:id/rfq')
  .get(generateRFQ);
  

  // Client route to consume a seat
router.route('/:id/consume')
  .patch(consumeSeat);
  
export default router;