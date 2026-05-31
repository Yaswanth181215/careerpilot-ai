import { Schema, model, Document } from 'mongoose';
import { ICodingSubmission } from '@careerpilot/types';

export interface ICodingSubmissionDocument extends Document, Omit<ICodingSubmission, '_id'> {}

const CodingSubmissionSchema = new Schema<ICodingSubmissionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problemId: { type: String, required: true, index: true },
    language: { type: String, enum: ['python', 'java', 'cpp', 'javascript'], required: true },
    code: { type: String, required: true },
    runtime: { type: Number, default: 0 },
    memory: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    results: [
      {
        testCaseId: { type: String, required: true },
        passed: { type: Boolean, required: true },
        input: { type: String, required: true },
        expected: { type: String, required: true },
        actual: { type: String, required: true },
        error: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const CodingSubmission = model<ICodingSubmissionDocument>('CodingSubmission', CodingSubmissionSchema);
export default CodingSubmission;
