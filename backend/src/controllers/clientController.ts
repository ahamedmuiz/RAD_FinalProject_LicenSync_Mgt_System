import { Request, Response } from 'express';
import crypto from 'crypto';
import ClientCompany from '../models/ClientCompany';
import User from '../models/User';

// @desc    Create a new client company AND their primary user account
// @route   POST /api/clients
// @access  Private / Project Manager Only
export const createClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyName, registrationNumber, billingAddress, phone, billingEmail, paymentTerms, primaryContactName } = req.body;

    // 1. Check if user email already exists to prevent crashes
    const userExists = await User.findOne({ email: billingEmail });
    if (userExists) {
      res.status(400).json({ message: 'A user with this billing email already exists' });
      return;
    }

    // 2. Generate a secure 12-character temporary password
    const tempPassword = crypto.randomBytes(6).toString('hex'); 

    // 3. Create the Company record first
    const company = await ClientCompany.create({
      companyName,
      registrationNumber,
      billingAddress,
      phone,
      billingEmail,
      paymentTerms: paymentTerms || 'Net 30',
      status: 'ACTIVE'
    });

    // 4. Create the User (Client) linked to this new company
    const user = await User.create({
      name: primaryContactName,
      email: billingEmail, 
      password: tempPassword,
      role: 'CLIENT',
      companyId: company._id,
      mustChangePassword: true, // Forces them to change it on first login!
    });

    // 5. Update the company to reference this user as the primary contact
    company.primaryContact = user._id as any;
    await company.save();

    // 6. Send the response back (The frontend PM dashboard will display this temp password once)
    res.status(201).json({
      message: 'Client company and user portal access created successfully',
      company,
      temporaryPassword: tempPassword 
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all client companies
// @route   GET /api/clients
// @access  Private / Project Manager Only
export const getClients = async (req: Request, res: Response): Promise<void> => {
  try {
    // We use .populate() to pull in the user's name and email automatically!
    const clients = await ClientCompany.find().populate('primaryContact', 'name email');
    res.json(clients);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};