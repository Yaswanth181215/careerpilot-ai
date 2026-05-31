import { Schema, model, Document } from 'mongoose';

export interface IMentorDocument extends Document {
  userId: Schema.Types.ObjectId;
  specialties: string[];
  rating: number;
  availability: Date[];
  isDeleted: boolean;
}

const MentorSchema = new Schema<IMentorDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specialties: [{ type: String, trim: true }],
    rating: { type: Number, default: 5 },
    availability: [{ type: Date }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MentorSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

export const Mentor = model<IMentorDocument>('Mentor', MentorSchema);
export default Mentor;
