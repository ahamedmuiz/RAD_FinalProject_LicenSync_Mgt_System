import mongoose, { Document, Schema } from 'mongoose';

export interface IClientCompany extends Document {
  companyName: string;
  registrationNumber?: string;
  taxId?: string;
  billingAddress?: string;
  phone?: string;
  billingEmail?: string;
  paymentTerms: 'Net 30' | 'Net 60' | 'Prepayment';
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  primaryContact?: mongoose.Types.ObjectId; // Links back to User
}

const clientCompanySchema: Schema = new Schema(
  {
    companyName: { type: String, required: true },
    registrationNumber: { type: String },
    taxId: { type: String },
    billingAddress: { type: String },
    phone: { type: String },
    billingEmail: { type: String },
    paymentTerms: { type: String, enum: ['Net 30', 'Net 60', 'Prepayment'], default: 'Net 30' },
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'ARCHIVED'], default: 'ACTIVE' },
    primaryContact: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const ClientCompany = mongoose.model<IClientCompany>('ClientCompany', clientCompanySchema);
export default ClientCompany;