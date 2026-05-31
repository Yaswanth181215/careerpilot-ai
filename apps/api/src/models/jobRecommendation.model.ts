import { Schema, model, Document } from 'mongoose';
import { IJobRecommendation } from '@careerpilot/types';

export interface IJobRecommendationDocument extends Document, Omit<IJobRecommendation, '_id'> {}

const JobRecommendationSchema = new Schema<IJobRecommendationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    jobTitle: { type: String, required: true },
    companyName: { type: String, required: true },
    location: { type: String, required: true },
    matchPercentage: { type: Number, required: true },
    matchingSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    recommendedResources: [{ type: String }],
    jobEmbeddings: { type: [Number] }, // For Atlas Vector Search matching
  },
  { timestamps: true }
);

export const JobRecommendation = model<IJobRecommendationDocument>('JobRecommendation', JobRecommendationSchema);
export default JobRecommendation;
