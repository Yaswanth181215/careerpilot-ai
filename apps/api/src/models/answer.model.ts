import { Schema, model, Document } from 'mongoose';
import { IAnswer } from '@careerpilot/types';

export interface IAnswerDocument extends Document, Omit<IAnswer, '_id'> {}

const AnswerSchema = new Schema<IAnswerDocument>(
  {
    interviewId: { type: Schema.Types.ObjectId, ref: 'Interview', required: true, index: true },
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
    userAnswerText: { type: String, required: true },
    audioUrl: { type: String },
    technicalAccuracyScore: { type: Number, default: 0 },
    communicationScore: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 0 },
    feedbackText: { type: String, required: true },
  },
  { timestamps: true }
);

export const Answer = model<IAnswerDocument>('Answer', AnswerSchema);
export default Answer;
