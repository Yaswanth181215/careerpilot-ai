import { Schema, model, Document } from 'mongoose';
import { IUser } from '@careerpilot/types';
import bcrypt from 'bcrypt';

export interface IUserDocument extends Document, Omit<IUser, '_id'> {
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['Student', 'Mentor', 'Admin', 'Super Admin'],
      default: 'Student',
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    refreshTokens: [{ type: String }],
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

// Compound index for active leaderboard ranking
UserSchema.index({ isDeleted: 1, xp: -1, level: -1 });

// Soft delete query middlewares
UserSchema.pre(/^find/, function (next) {
  const query = this.getQuery();
  if (query.isDeleted === undefined) {
    this.where({ isDeleted: false });
  }
  next();
});

// Pre-save password hashing hook
UserSchema.pre('save', async function (next) {
  const user = this as IUserDocument;
  if (!user.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password as string, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Instance method to compare passwords
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUserDocument>('User', UserSchema);
export default User;
