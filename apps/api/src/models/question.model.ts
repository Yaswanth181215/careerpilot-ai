import { Schema, model, Document } from 'mongoose';
import { IQuestion } from '@careerpilot/types';

export interface IQuestionDocument extends Document, Omit<IQuestion, '_id'> {}

const QuestionSchema = new Schema<any>(
  {
    interviewId: { type: Schema.Types.ObjectId, ref: 'Interview', required: true, index: true },
    questionText: { type: String, required: true },
    expectedAnswer: { type: String },
  },
  { timestamps: true }
);

export const Question = model<IQuestionDocument>('Question', QuestionSchema);
export default Question;
