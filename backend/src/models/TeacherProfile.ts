import mongoose, { Document, Schema } from 'mongoose';

export interface ITeacherProfile extends Document {
  userId: mongoose.Types.ObjectId;
  connectedStudents: mongoose.Types.ObjectId[];
  assignedTasks: mongoose.Types.ObjectId[];
  code?: string;
}

const TeacherProfileSchema = new Schema<ITeacherProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  connectedStudents: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  assignedTasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  code: { type: String, required: false, unique: true }
});

export default mongoose.model<ITeacherProfile>('TeacherProfile', TeacherProfileSchema);
