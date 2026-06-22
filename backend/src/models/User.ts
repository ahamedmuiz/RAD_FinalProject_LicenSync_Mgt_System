import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// 1. Define the strict TypeScript Interface
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'PROJECT_MANAGER' | 'CLIENT';
  companyId?: mongoose.Types.ObjectId; // Links to ClientCompany
  mustChangePassword?: boolean;
  passwordResetCode?: string;
  passwordResetExpires?: Date;
  isActive: boolean;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// 2. Define the Mongoose Schema
const userSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['PROJECT_MANAGER', 'CLIENT'], default: 'CLIENT' },
    companyId: { type: Schema.Types.ObjectId, ref: 'ClientCompany', default: null },
    mustChangePassword: { type: Boolean, default: false },
    passwordResetCode: { type: String },
    passwordResetExpires: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

// 3. Method to check if entered password matches hashed password
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 4. Hook to automatically hash the password before saving to DB
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return; // Just return instead of calling next()
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;