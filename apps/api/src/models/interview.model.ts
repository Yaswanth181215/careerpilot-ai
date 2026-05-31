import { Schema, model, Document } from 'mongoose';
import { IInterview } from '@careerpilot/types';

export interface IInterviewDocument extends Document, Omit<IInterview, '_id' | 'questions' | 'answers'> {}

const InterviewSchema = new Schema<any>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    domain: {
      type: String,
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ['Fresher', 'Intermediate', 'Advanced'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'In-Progress', 'Completed'],
      default: 'Scheduled',
    },
    videoUrl: { type: String },
  },
  { timestamps: true }
);

export const Interview = model<IInterviewDocument>('Interview', InterviewSchema);
export default Interview;
