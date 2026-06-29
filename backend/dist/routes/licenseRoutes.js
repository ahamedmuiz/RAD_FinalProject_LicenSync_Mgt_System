"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const licenseController_1 = require("../controllers/licenseController");
const router = express_1.default.Router();
// ALL routes in this file require the user to be logged in
router.use(authMiddleware_1.protect);
// GET is accessible by both PMs and Clients. POST is restricted to PMs.
router.route('/')
    .get(licenseController_1.getLicenses)
    .post(authMiddleware_1.projectManagerOnly, licenseController_1.createLicense);
// Modify your /:id route block:
router.route('/:id')
    .put(authMiddleware_1.protect, authMiddleware_1.projectManagerOnly, licenseController_1.updateLicense)
    .delete(authMiddleware_1.protect, authMiddleware_1.projectManagerOnly, licenseController_1.deleteLicense);
// Add the email quote route:
router.post('/:id/email-quote', authMiddleware_1.protect, authMiddleware_1.projectManagerOnly, licenseController_1.emailQuote);
// GET is accessible by both PMs and Clients so they can download the quote
router.route('/:id/rfq')
    .get(licenseController_1.generateRFQ);
// Client route to consume a seat
router.route('/:id/consume')
    .patch(licenseController_1.consumeSeat);
exports.default = router;
