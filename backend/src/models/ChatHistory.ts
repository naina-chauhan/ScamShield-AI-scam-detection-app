import mongoose, { Document, Schema } from 'mongoose';

interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IChatHistory extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  messages: IMessage[];
  title: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ChatHistorySchema = new Schema<IChatHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
    title: {
      type: String,
      default: 'New Chat',
    },
    language: {
      type: String,
      default: 'en',
    },
  },
  {
    timestamps: true,
  }
);

ChatHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IChatHistory>('ChatHistory', ChatHistorySchema);
