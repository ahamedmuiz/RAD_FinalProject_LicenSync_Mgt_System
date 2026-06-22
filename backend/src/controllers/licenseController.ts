import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import SoftwareLicense from '../models/SoftwareLicense';
import { buildRFQDocument } from '../services/pdfGenerator';

// @desc    Create a new software license
// @route   POST /api/licenses
// @access  Private / Project Manager Only
export const createLicense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { clientId, softwareName, vendor, seatCount, licenseKey, issueDate, expiryDate } = req.body;

    const license = await SoftwareLicense.create({
      clientId,
      softwareName,
      vendor,
      seatCount,
      licenseKey,
      issueDate: issueDate || Date.now(),
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
      licenses = await SoftwareLicense.find({ clientId: req.user?.companyId }).populate('clientId', 'companyName');
    }

    res.json(licenses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an existing license
// @route   PUT /api/licenses/:id
// @access  Private / Project Manager Only
export const updateLicense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const license = await SoftwareLicense.findById(req.params.id);

    if (!license) {
      res.status(404).json({ message: 'License not found' });
      return;
    }

    const updatedLicense = await SoftwareLicense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Returns the updated document and runs schema validation
    ).populate('clientId', 'companyName');

    res.json(updatedLicense);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

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
// @access  Private / Both Roles (Clients can download their own quotes)
export const generateRFQ = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 1. Fetch the license and populate the client details
    const license = await SoftwareLicense.findById(req.params.id).populate('clientId');

    if (!license) {
      res.status(404).json({ message: 'License not found' });
      return;
    }

    const client = license.clientId as any; // Typecasting for populated document

    // 2. Security Check: If the user is a CLIENT, ensure this license belongs to them
    if (req.user?.role === 'CLIENT' && req.user.companyId?.toString() !== client._id.toString()) {
      res.status(403).json({ message: 'Not authorized to view this document' });
      return;
    }

    // 3. Prepare the data for the PDF (Using a standard $120/seat placeholder for the quote)
    const pricePerSeat = 120.00; 
    
    const rfqData = {
      quotationNumber: `RFQ-${license._id.toString().substring(0, 6).toUpperCase()}`,
      date: new Date().toLocaleDateString(),
      companyName: client.companyName,
      billingAddress: client.billingAddress || 'No address provided',
      softwareName: license.softwareName,
      vendor: license.vendor,
      seatCount: license.seatCount,
      expiryDate: new Date(license.expiryDate).toLocaleDateString(),
      pricePerSeat: pricePerSeat,
      totalAmount: license.seatCount * pricePerSeat,
      paymentTerms: client.paymentTerms || 'Net 30'
    };

    // 4. Trigger the PDF generation (This will stream directly back to the user!)
    buildRFQDocument(res, rfqData);

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};