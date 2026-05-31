import { Schema, model, Document } from 'mongoose';
import { ILearningRoadmap } from '@careerpilot/types';

export interface IRoadmapDocument extends Document, Omit<ILearningRoadmap, '_id'> {}

const RoadmapSchema = new Schema<IRoadmapDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    durationWeeks: { type: Number, required: true },
    weeklyPlan: [
      {
        week: { type: Number, required: true },
        topic: { type: String, required: true },
        tasks: [{ type: String }],
        resources: [{ type: String }],
        projectIdea: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const Roadmap = model<IRoadmapDocument>('Roadmap', RoadmapSchema);
export default Roadmap;
