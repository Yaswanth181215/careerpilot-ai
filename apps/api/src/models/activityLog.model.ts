import { Schema, model, Document } from 'mongoose';
import { IAuditLog } from '@careerpilot/types';

export interface IActivityLogDocument extends Document, Omit<IAuditLog, '_id'> {}

const ActivityLogSchema = new Schema<IActivityLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true, index: true },
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    metadata: { type: Schema.Types.Map, of: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false } // We use explicit timestamp
);

// Compound index for audits query filtering
ActivityLogSchema.index({ userId: 1, action: 1, timestamp: -1 });

export const ActivityLog = model<IActivityLogDocument>('ActivityLog', ActivityLogSchema);
export default ActivityLog;
