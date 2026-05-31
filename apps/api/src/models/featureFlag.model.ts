import { Schema, model, Document } from 'mongoose';
import { IFeatureFlag } from '@careerpilot/types';

export interface IFeatureFlagDocument extends Document, Omit<IFeatureFlag, '_id'> {}

const FeatureFlagSchema = new Schema<IFeatureFlagDocument>(
  {
    name: { type: String, required: true, unique: true, index: true, trim: true },
    description: { type: String },
    isEnabled: { type: Boolean, default: false },
    allowedRoles: [{ type: String, enum: ['Student', 'Mentor', 'Admin', 'Super Admin'] }],
    allowedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const FeatureFlag = model<IFeatureFlagDocument>('FeatureFlag', FeatureFlagSchema);
export default FeatureFlag;
