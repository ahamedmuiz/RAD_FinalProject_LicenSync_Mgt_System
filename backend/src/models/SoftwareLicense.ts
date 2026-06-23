import mongoose, { Document, Schema } from "mongoose";

export interface ISoftwareLicense extends Document {
  clientId: mongoose.Types.ObjectId; // Links to ClientCompany
  softwareName: string;
  vendor: string;
  totalSeats: number;
  seatCount: number;
  licenseKey: string;
  issueDate: Date;
  expiryDate: Date;
  status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED";
}

const softwareLicenseSchema: Schema = new Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "ClientCompany",
      required: true,
    },
    softwareName: { type: String, required: true },
    vendor: { type: String, required: true },

    totalSeats: {type: Number,required: true},
    seatCount: {type: Number,required: true},
    licenseKey: { type: String, required: true }, 
    issueDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRING_SOON", "EXPIRED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true },
);

// Pre-save hook to automatically calculate if the license is active, expiring soon (within 30 days), or expired
softwareLicenseSchema.pre<ISoftwareLicense>("save", function (next) {
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);

  if (this.expiryDate < now) {
    this.status = "EXPIRED";
  } else if (this.expiryDate <= thirtyDaysFromNow) {
    this.status = "EXPIRING_SOON";
  } else {
    this.status = "ACTIVE";
  }
});

const SoftwareLicense = mongoose.model<ISoftwareLicense>(
  "SoftwareLicense",
  softwareLicenseSchema,
);
export default SoftwareLicense;
