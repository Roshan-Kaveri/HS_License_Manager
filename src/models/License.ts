import mongoose, { Document, Model } from 'mongoose';

interface RequestMeta {
  count: number;
  lastSeen: Date;
}

interface RequestLog {
  ip: string;
  timestamp: Date;
}

interface LicenseDocument extends Document {
  userId: string;
  status: 'Normal' | 'Restricted' | 'Terminated';
  totalRequests: number;
  requestCounts: Record<string, RequestMeta>; // per IP
  requests: RequestLog[];
}

const LicenseSchema = new mongoose.Schema<LicenseDocument>({
  userId: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ['Normal', 'Restricted', 'Terminated'],
    default: 'Normal',
  },
  totalRequests: { type: Number, default: 0 },
  requestCounts: {
    type: Map,
    of: new mongoose.Schema<RequestMeta>({
      count: { type: Number, default: 0 },
      lastSeen: { type: Date, required: true },
    }),
    default: {}
  },
  requests: [{
    ip: { type: String, required: true },
    timestamp: { type: Date, required: true }
  }]
});

LicenseSchema.index({ userId: 1 });

const License: Model<LicenseDocument> = mongoose.model<LicenseDocument>('License', LicenseSchema);

export default License;
