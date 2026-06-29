"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClient = exports.updateClient = exports.getClients = exports.createClient = void 0;
const crypto_1 = __importDefault(require("crypto"));
const ClientCompany_1 = __importDefault(require("../models/ClientCompany"));
const User_1 = __importDefault(require("../models/User"));
// @desc    Create a new client company AND their primary user account
// @route   POST /api/clients
// @access  Private / Project Manager Only
const createClient = async (req, res) => {
    try {
        const { companyName, registrationNumber, billingAddress, phone, billingEmail, paymentTerms, primaryContactName } = req.body;
        // 1. Check if user email already exists to prevent crashes
        const userExists = await User_1.default.findOne({ email: billingEmail });
        if (userExists) {
            res.status(400).json({ message: 'A user with this billing email already exists' });
            return;
        }
        // 2. Generate a secure 12-character temporary password
        const tempPassword = crypto_1.default.randomBytes(6).toString('hex');
        // 3. Create the Company record first
        const company = await ClientCompany_1.default.create({
            companyName,
            registrationNumber,
            billingAddress,
            phone,
            billingEmail,
            paymentTerms: paymentTerms || 'Net 30',
            status: 'ACTIVE'
        });
        // 4. Create the User (Client) linked to this new company
        const user = await User_1.default.create({
            name: primaryContactName,
            email: billingEmail,
            password: tempPassword,
            role: 'CLIENT',
            companyId: company._id,
            mustChangePassword: true, // Forces them to change it on first login!
        });
        // 5. Update the company to reference this user as the primary contact
        company.primaryContact = user._id;
        await company.save();
        // 6. Send the response back (The frontend PM dashboard will display this temp password once)
        res.status(201).json({
            message: 'Client company and user portal access created successfully',
            company,
            temporaryPassword: tempPassword
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createClient = createClient;
// @desc    Get all client companies
// @route   GET /api/clients
// @access  Private / Project Manager Only
const getClients = async (req, res) => {
    try {
        // We use .populate() to pull in the user's name and email automatically!
        const clients = await ClientCompany_1.default.find().populate('primaryContact', 'name email');
        res.json(clients);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getClients = getClients;
// @desc    Update a client company
// @route   PUT /api/clients/:id
// @access  Private / Project Manager Only
const updateClient = async (req, res) => {
    try {
        const updatedClient = await ClientCompany_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('primaryContact', 'name email');
        if (!updatedClient) {
            res.status(404).json({ message: 'Client not found' });
            return;
        }
        res.json(updatedClient);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updateClient = updateClient;
// @desc    Delete a client company (Cascading delete)
// @route   DELETE /api/clients/:id
// @access  Private / Project Manager Only
const deleteClient = async (req, res) => {
    try {
        const client = await ClientCompany_1.default.findById(req.params.id);
        if (!client) {
            res.status(404).json({ message: 'Client not found' });
            return;
        }
        // 1. Delete the User associated with this company
        await User_1.default.deleteOne({ companyId: client._id });
        // 2. Delete all Software Licenses associated with this company
        // (Requires importing SoftwareLicense at the top of this file!)
        const SoftwareLicense = require('../models/SoftwareLicense').default;
        await SoftwareLicense.deleteMany({ clientId: client._id });
        // 3. Delete the company itself
        await client.deleteOne();
        res.json({ message: 'Client, user account, and all licenses completely removed' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteClient = deleteClient;
