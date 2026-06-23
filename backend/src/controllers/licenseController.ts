import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import SoftwareLicense from '../models/SoftwareLicense';
import { buildRFQDocument } from '../services/pdfGenerator';
import { sendEmail } from '../utils/sendEmail';
import { buildRFQBuffer } from '../services/pdfGenerator'; 

// @desc    Create a new software license
// @route   POST /api/licenses
// @access  Private / Project Manager Only
export const createLicense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId, softwareName, vendor, seatCount, licenseKey, expiryDate } = req.body;

    const license = await SoftwareLicense.create({
      clientId,
      softwareName,
      vendor,
      totalSeats: seatCount, // NEW: Saves the original purchased amount
      seatCount: seatCount,  // NEW: Sets the currently available seats
      licenseKey,
      expiryDate,
    });

    res.status(201).json(license);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all licenses (Filters automatically based on Role!)
// @route   GET /api/licenses
// @access  Private / Both Roles
export const getLicenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let licenses;

    if (req.user?.role === 'PROJECT_MANAGER') {
      // PMs see everything, with the client company data attached
      licenses = await SoftwareLicense.find().populate('clientId', 'companyName billingEmail status');
    } else {
      // Clients ONLY see licenses linked to their specific company ID
      // UPDATE: Populate full company details so the client can view them!
      licenses = await SoftwareLicense.find({ clientId: req.user?.companyId }).populate('clientId', 'companyName billingEmail phone paymentTerms billingAddress registrationNumber');
    }

    res.json(licenses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an existing license
// @route   PUT /api/licenses/:id
// @access  Private / Project Manager Only
// export const updateLicense = async (req: AuthRequest, res: Response): Promise<void> => {
//   try {
//     const license = await SoftwareLicense.findById(req.params.id);

//     if (!license) {
//       res.status(404).json({ message: 'License not found' });
//       return;
//     }

//     const updatedLicense = await SoftwareLicense.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true } // Returns the updated document and runs schema validation
//     ).populate('clientId', 'companyName');

//     res.json(updatedLicense);
//   } catch (error: any) {
//     res.status(400).json({ message: error.message });
//   }
// };

// @desc    Delete a license
// @route   DELETE /api/licenses/:id
// @access  Private / Project Manager Only
export const deleteLicense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const license = await SoftwareLicense.findById(req.params.id);

    if (!license) {
      res.status(404).json({ message: 'License not found' });
      return;
    }

    await license.deleteOne();
    res.json({ message: 'License removed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate PDF Request for Quotation
// @route   GET /api/licenses/:id/rfq
// @access  Private / Both Roles
export const generateRFQ = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const license = await SoftwareLicense.findById(req.params.id).populate('clientId');

    if (!license) {
      res.status(404).json({ message: 'License not found' });
      return;
    }

    const client = license.clientId as any;

    if (req.user?.role === 'CLIENT' && req.user.companyId?.toString() !== client._id.toString()) {
      res.status(403).json({ message: 'Not authorized to view this document' });
      return;
    }

    // --- DYNAMIC DATA UPGRADE ---
    // Look at the URL query. If they provided a custom price/seat count, use it. Otherwise, default to the database values.
    const pricePerSeat = req.query.price ? parseFloat(req.query.price as string) : 120.00; 
    const requestedSeats = req.query.seats ? parseInt(req.query.seats as string) : license.seatCount;
    
    const rfqData = {
      quotationNumber: `RFQ-${license._id.toString().substring(0, 6).toUpperCase()}`,
      date: new Date().toLocaleDateString(),
      companyName: client.companyName,
      billingAddress: client.billingAddress || 'No address provided',
      softwareName: license.softwareName,
      vendor: license.vendor,
      seatCount: requestedSeats,         // Now dynamic!
      expiryDate: new Date(license.expiryDate).toLocaleDateString(),
      pricePerSeat: pricePerSeat,        // Now dynamic!
      totalAmount: requestedSeats * pricePerSeat, // Auto-calculates the new total!
      paymentTerms: client.paymentTerms || 'Net 30'
    };

    // Trigger the PDF generation
    const { buildRFQDocument } = require('../services/pdfGenerator');
    buildRFQDocument(res, rfqData);

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Consume 1 License Seat
// @route   PATCH /api/licenses/:id/consume
// @access  Private / Clients
export const consumeSeat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const license = await SoftwareLicense.findById(req.params.id);
    if (!license) {
      res.status(404).json({ message: 'License not found' });
      return;
    }
    // Security: Ensure client owns this license
    if (req.user?.role === 'CLIENT' && req.user.companyId?.toString() !== license.clientId.toString()) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    if (license.seatCount <= 0) {
      res.status(400).json({ message: 'No seats available to consume.' });
      return;
    }

    license.seatCount -= 1;
    await license.save();
    
    // Return updated license with populated client so Redux updates perfectly
    const updatedLicense = await SoftwareLicense.findById(license._id).populate('clientId', 'companyName');
    res.json(updatedLicense);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Update a software license
// @route   PUT /api/licenses/:id
// @access  Private / Project Manager Only
export const updateLicense = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedLicense = await SoftwareLicense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedLicense) {
      res.status(404).json({ message: 'License not found' });
      return;
    }

    res.json(updatedLicense);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Generate and Email PDF Request for Quotation
// @route   POST /api/licenses/:id/email-quote
// @access  Private / Project Manager Only
export const emailQuote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const license = await SoftwareLicense.findById(req.params.id).populate('clientId');
    if (!license) { res.status(404).json({ message: 'License not found' }); return; }

    const client = license.clientId as any;
    const pricePerSeat = req.body.price || 120.00; 
    const requestedSeats = req.body.seats || license.seatCount;
    
    const rfqData = {
      quotationNumber: `RFQ-${license._id.toString().substring(0, 6).toUpperCase()}`,
      date: new Date().toLocaleDateString(),
      companyName: client.companyName,
      softwareName: license.softwareName,
      vendor: license.vendor,
      seatCount: requestedSeats,
      pricePerSeat: pricePerSeat,
      totalAmount: requestedSeats * pricePerSeat,
    };

    // 1. Generate the PDF in memory
    const pdfBuffer = await buildRFQBuffer(rfqData);

    // 2. Send the email with the PDF attached
    await sendEmail({
      email: client.billingEmail, // Sends to the client's email
      subject: `LicenSync Quotation - ${rfqData.quotationNumber}`,
      html: `<h3>Hello ${client.companyName},</h3>
             <p>Please find attached your requested quotation for <strong>${rfqData.softwareName}</strong> (${rfqData.seatCount} seats).</p>
             <p>Total Amount: <strong>$${rfqData.totalAmount}</strong></p>
             <br><p>Best regards,<br>Elite Software Solutions</p>`,
      attachments: [
        {
          filename: `${rfqData.quotationNumber}.pdf`,
          content: pdfBuffer,
        }
      ]
    });

    res.status(200).json({ message: 'Quotation sent successfully to ' + client.billingEmail });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};