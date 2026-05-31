import { Schema, model, Document } from 'mongoose';

export interface IAchievementDocument extends Document {
  userId: Schema.Types.ObjectId;
  badgeName: 'Interview Master' | 'DSA Expert' | 'Coding Warrior' | 'Resume Pro' | 'Career Accelerator';
  unlockedAt: Date;
  description: string;
}

const AchievementSchema = new Schema<IAchievementDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    badgeName: {
      type: String,
      enum: ['Interview Master', 'DSA Expert', 'Coding Warrior', 'Resume Pro', 'Career Accelerator'],
      required: true,
    },
    description: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Ensure a user gets a badge only once
AchievementSchema.index({ userId: 1, badgeName: 1 }, { unique: true });

export const Achievement = model<IAchievementDocument>('Achievement', AchievementSchema);
export default Achievement;
