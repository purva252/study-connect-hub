import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentProfile extends Document {
  userId: mongoose.Types.ObjectId;
  connectedTeachers: mongoose.Types.ObjectId[];
  selfTasks: mongoose.Types.ObjectId[];
}

const StudentProfileSchema = new Schema<IStudentProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  connectedTeachers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  selfTasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }]
});

export default mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);
