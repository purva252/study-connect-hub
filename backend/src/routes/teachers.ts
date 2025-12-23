import express from 'express';
import { protect } from '../middleware/auth';
import TeacherProfile from '../models/TeacherProfile';
import User from '../models/User';

const router = express.Router();

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
