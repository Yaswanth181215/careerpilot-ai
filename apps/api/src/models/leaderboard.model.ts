import { Schema, model, Document } from 'mongoose';

export interface ILeaderboardDocument extends Document {
  userId: Schema.Types.ObjectId;
  userName: string;
  xp: number;
  level: number;
  rank: number;
  type: 'Global' | 'College' | 'Department';
  scopeValue?: string; // e.g. College Name or Department Name
  updatedAt: Date;
}

const LeaderboardSchema = new Schema<ILeaderboardDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    xp: { type: Number, required: true },
    level: { type: Number, required: true },
    rank: { type: Number, required: true },
    type: { type: String, enum: ['Global', 'College', 'Department'], required: true, index: true },
    scopeValue: { type: String, index: true },
  },
  { timestamps: true }
);

LeaderboardSchema.index({ type: 1, rank: 1 });

export const Leaderboard = model<ILeaderboardDocument>('Leaderboard', LeaderboardSchema);
export default Leaderboard;
