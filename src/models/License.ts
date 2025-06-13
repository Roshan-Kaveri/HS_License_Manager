import mongoose, { Document, Model } from 'mongoose';

interface LicenseDocument extends Document {
  userId: string;
  servers: string[];
  requestCount: number;
  status: 'Normal' | 'Restricted' | 'Terminated';
}

const LicenseSchema = new mongoose.Schema<LicenseDocument>({
  userId: { type: String, required: true },
  servers: [{ type: String }],
  requestCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Normal', 'Restricted', 'Terminated'],
    default: 'Normal' // ✅ default status
  }
});

LicenseSchema.index({ userId: 1 });

const License: Model<LicenseDocument> = mongoose.model<LicenseDocument>('License', LicenseSchema);

export default License;
