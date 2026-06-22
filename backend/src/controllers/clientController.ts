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

// @desc    Update a client company
// @route   PUT /api/clients/:id
// @access  Private / Project Manager Only
export const updateClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedClient = await ClientCompany.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('primaryContact', 'name email');

    if (!updatedClient) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }

    res.json(updatedClient);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a client company (Cascading delete)
// @route   DELETE /api/clients/:id
// @access  Private / Project Manager Only
export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await ClientCompany.findById(req.params.id);

    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }

    // 1. Delete the User associated with this company
    await User.deleteOne({ companyId: client._id });

    // 2. Delete all Software Licenses associated with this company
    // (Requires importing SoftwareLicense at the top of this file!)
    const SoftwareLicense = require('../models/SoftwareLicense').default; 
    await SoftwareLicense.deleteMany({ clientId: client._id });

    // 3. Delete the company itself
    await client.deleteOne();

    res.json({ message: 'Client, user account, and all licenses completely removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

