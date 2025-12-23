import mongoose, { Document, Schema } from 'mongoose';

export interface IConnection extends Document {
  teacher: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

const ConnectionSchema = new Schema<IConnection>({
  teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

ConnectionSchema.index({ teacher: 1, student: 1 }, { unique: true });

export default mongoose.model<IConnection>('Connection', ConnectionSchema);
