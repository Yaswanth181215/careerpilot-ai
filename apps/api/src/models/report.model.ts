import { Schema, model, Document } from 'mongoose';
import { IReport } from '@careerpilot/types';

export interface IReportDocument extends Document, Omit<IReport, '_id'> {}

const ReportSchema = new Schema<IReportDocument>(
  {
    interviewId: { type: Schema.Types.ObjectId, ref: 'Interview', required: true, unique: true },
    overallScore: { type: Number, required: true },
    technicalScore: { type: Number, required: true },
    communicationScore: { type: Number, required: true },
    confidenceScore: { type: Number, required: true },
    summary: { type: String, required: true },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendations: [{ type: String }],
  },
  { timestamps: true }
);

export const Report = model<IReportDocument>('Report', ReportSchema);
export default Report;
