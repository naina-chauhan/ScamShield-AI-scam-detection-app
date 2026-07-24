import mongoose, { Document, Schema } from 'mongoose';

export interface IScamReport extends Document {
  userId: mongoose.Types.ObjectId;
  reportText: string;
  category: string;
  scanId?: mongoose.Types.ObjectId;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

const ScamReportSchema = new Schema<IScamReport>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reportText: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    scanId: {
      type: Schema.Types.ObjectId,
      ref: 'ScanHistory',
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

ScamReportSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IScamReport>('ScamReport', ScamReportSchema);
