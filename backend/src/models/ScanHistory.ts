import mongoose, { Document, Schema } from 'mongoose';

export interface IScanHistory extends Document {
  userId: mongoose.Types.ObjectId;
  scanType: 'text' | 'url' | 'email';
  inputText: string;
  status: 'scam' | 'warning' | 'safe';
  confidence: number;
  explanation: string;
  detailedReasoning: string[];
  scamCategory: string;
  suspiciousWords: string[];
  privacyMode: boolean;
  language: string;
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
}

const ScanHistorySchema = new Schema<IScanHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    scanType: {
      type: String,
      enum: ['text', 'url', 'email'],
      required: true,
    },
    inputText: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['scam', 'warning', 'safe'],
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    explanation: {
      type: String,
      required: true,
    },
    detailedReasoning: {
      type: [String],
      default: [],
    },
    scamCategory: {
      type: String,
      required: true,
    },
    suspiciousWords: {
      type: [String],
      default: [],
    },
    privacyMode: {
      type: Boolean,
      default: false,
    },
    language: {
      type: String,
      default: 'en',
    },
    embedding: {
      type: [Number],
      select: false, // Don't return by default
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
ScanHistorySchema.index({ userId: 1, createdAt: -1 });
ScanHistorySchema.index({ scamCategory: 1 });

export default mongoose.model<IScanHistory>('ScanHistory', ScanHistorySchema);
