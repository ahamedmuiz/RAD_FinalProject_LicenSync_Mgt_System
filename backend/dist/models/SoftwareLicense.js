"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const softwareLicenseSchema = new mongoose_1.Schema({
    clientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "ClientCompany",
        required: true,
    },
    softwareName: { type: String, required: true },
    vendor: { type: String, required: true },
    totalSeats: { type: Number, required: true },
    seatCount: { type: Number, required: true },
    licenseKey: { type: String, required: true },
    issueDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ["ACTIVE", "EXPIRING_SOON", "EXPIRED"],
        default: "ACTIVE",
    },
}, { timestamps: true });
// Pre-save hook to automatically calculate if the license is active, expiring soon (within 30 days), or expired
softwareLicenseSchema.pre("save", function (next) {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    if (this.expiryDate < now) {
        this.status = "EXPIRED";
    }
    else if (this.expiryDate <= thirtyDaysFromNow) {
        this.status = "EXPIRING_SOON";
    }
    else {
        this.status = "ACTIVE";
    }
});
const SoftwareLicense = mongoose_1.default.model("SoftwareLicense", softwareLicenseSchema);
exports.default = SoftwareLicense;
