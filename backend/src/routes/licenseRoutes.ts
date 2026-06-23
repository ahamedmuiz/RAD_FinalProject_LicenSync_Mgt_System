import express from 'express';
import { protect, projectManagerOnly } from '../middleware/authMiddleware';
import { createLicense, getLicenses, consumeSeat, generateRFQ, updateLicense, emailQuote, deleteLicense } from '../controllers/licenseController';
const router = express.Router();

// ALL routes in this file require the user to be logged in
router.use(protect);

// GET is accessible by both PMs and Clients. POST is restricted to PMs.
router.route('/')
  .get(getLicenses)
  .post(projectManagerOnly, createLicense);

// Modify your /:id route block:
router.route('/:id')
  .put(protect, projectManagerOnly, updateLicense) 
  .delete(protect, projectManagerOnly, deleteLicense); 

// Add the email quote route:
router.post('/:id/email-quote', protect, projectManagerOnly, emailQuote);


  // GET is accessible by both PMs and Clients so they can download the quote
router.route('/:id/rfq')
  .get(generateRFQ);
  

  // Client route to consume a seat
router.route('/:id/consume')
  .patch(consumeSeat);
  
export default router;