import { Schema, model, Document } from 'mongoose';
import { IResume } from '@careerpilot/types';

export interface IResumeDocument extends Document, Omit<IResume, '_id'> {
  isDeleted: boolean;
}

const ResumeSchema = new Schema<any>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    extractedText: { type: String, required: true },
    embeddings: { type: [Number], required: true }, // For Atlas Vector Search
    atsScore: { type: Number, default: 0 },
    skills: [{ type: String, trim: true }],
    experience: [
      {
        role: { type: String, required: true },
        company: { type: String, required: true },
        duration: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    education: [
      {
        degree: { type: String, required: true },
        school: { type: String, required: true },
        year: { type: String, required: true },
      },
    ],
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    suggestions: [{ type: String }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ResumeSchema.pre(/^find/, function (next) {
  (this as any).find({ isDeleted: false });
  next();
});

export const Resume = model<IResumeDocument>('Resume', ResumeSchema);
export default Resume;
