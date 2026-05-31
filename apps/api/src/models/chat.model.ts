import { Schema, model, Document } from 'mongoose';

export interface IChatDocument extends Document {
  roomId: string;
  senderId: Schema.Types.ObjectId;
  messageText: string;
  createdAt: Date;
}

const ChatSchema = new Schema<IChatDocument>(
  {
    roomId: { type: String, required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    messageText: { type: String, required: true },
  },
  { timestamps: true }
);

export const Chat = model<IChatDocument>('Chat', ChatSchema);
export default Chat;
