import express from 'express';
import { protect, roleCheck } from '../middleware/auth';
import TeacherProfile from '../models/TeacherProfile';
import User from '../models/User';

const router = express.Router();

// Get current teacher's profile
router.get('/profile', protect, roleCheck(['teacher']), async (req, res) => {
  const teacher = (req as any).user;
  try {
    const profile = await TeacherProfile.findOne({ userId: teacher._id })
      .populate('connectedStudents', 'name email')
      .populate('assignedTasks');
    
    if (!profile) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }
    
    res.json({
      _id: profile._id,
      userId: profile.userId,
      code: profile.code,
      connectedStudents: profile.connectedStudents,
      assignedTasks: profile.assignedTasks
    });
  } catch (err) {
    console.error('[teachers.profile] error:', err);
    res.status(500).json({ message: 'Failed to fetch teacher profile' });
  }
});

// List teachers (protected)
router.get('/', protect, async (req, res) => {
  try {
    const list = await TeacherProfile.find().populate('userId', 'name email');
    res.json(list.map(t => ({ id: t._id, userId: t.userId, code: t.code })));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch teachers' });
  }
});

export default router;
