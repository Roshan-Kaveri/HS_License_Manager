import mongoose, { Document, Model } from 'mongoose';

interface RequestMeta {
  count: number;
  lastSeen: Date;
}

interface RequestLog {
  ip: string;
  timestamp: Date;
}

export interface LicenseDocument extends Document {
  userId: string;
  project: string;
  status: 'Normal' | 'Restricted' | 'Terminated';
  totalRequests: number;
  requestCounts: Record<string, RequestMeta>; // use plain object
  requests: RequestLog[];
}

const RequestMetaSchema = new mongoose.Schema<RequestMeta>({
  count: { type: Number, default: 1 },
  lastSeen: { type: Date, required: true },
}, { _id: false });

const RequestLogSchema = new mongoose.Schema<RequestLog>({
  ip: { type: String, required: true },
  timestamp: { type: Date, required: true }
}, { _id: false });

const LicenseSchema = new mongoose.Schema<LicenseDocument>({
  userId: { type: String, required: true },
  project: { type: String, required: true },
  status: {
    type: String,
    enum: ['Normal', 'Restricted', 'Terminated'],
    default: 'Normal',
  },
  totalRequests: { type: Number, default: 0 },
  requestCounts: {
    type: Object, // ✅ fixed: plain object instead of Map
    default: {}
  },
  requests: {
    type: [RequestLogSchema],
    default: []
  }
});

LicenseSchema.index({ userId: 1, project: 1 }, { unique: true });

const License: Model<LicenseDocument> = mongoose.model<LicenseDocument>('License', LicenseSchema);

export default License;
