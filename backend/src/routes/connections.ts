import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect, roleCheck } from '../middleware/auth';
import Connection from '../models/Connection';
import TeacherProfile from '../models/TeacherProfile';
import StudentProfile from '../models/StudentProfile';

const router = express.Router();

// Teacher sends invite to student
router.post(
  '/invite',
  protect,
  roleCheck(['teacher']),
  body('studentId').isString().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const teacher = (req as any).user;
    const { studentId } = req.body;
    try {
      const existing = await Connection.findOne({ teacher: teacher._id, student: studentId });
      if (existing) return res.status(409).json({ message: 'Invite already exists' });
      const conn = await Connection.create({ teacher: teacher._id, student: studentId });
      res.status(201).json(conn);
    } catch (err) {
      res.status(500).json({ message: 'Failed to send invite' });
    }
  }
);

// Student responds to invite
router.patch('/invite/:id/respond', protect, roleCheck(['student']), async (req, res) => {
  const student = (req as any).user;
  const { id } = req.params;
  const { action } = req.body; // 'accept' | 'reject'
  if (!['accept', 'reject'].includes(action)) return res.status(400).json({ message: 'Invalid action' });
  try {
    const conn = await Connection.findById(id);
    if (!conn) return res.status(404).json({ message: 'Invite not found' });
    if (String(conn.student) !== String(student._id)) return res.status(403).json({ message: 'Forbidden' });
    conn.status = action === 'accept' ? 'accepted' : 'rejected';
    await conn.save();
    if (action === 'accept') {
      // update profiles
      await TeacherProfile.updateOne({ userId: conn.teacher }, { $push: { connectedStudents: conn.student } });
      await StudentProfile.updateOne({ userId: conn.student }, { $push: { connectedTeachers: conn.teacher } });
    }
    res.json(conn);
  } catch (err) {
    res.status(500).json({ message: 'Failed to respond to invite' });
  }
});

// List connections for user
router.get('/', protect, async (req, res) => {
  const user = (req as any).user;
  try {
    let list;
    if (user.role === 'teacher') {
      list = await Connection.find({ teacher: user._id }).populate('student', 'name email');
    } else {
      list = await Connection.find({ student: user._id }).populate('teacher', 'name email');
    }
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch connections' });
  }
});

// Student requests connection to a teacher by teacherId (or teacher code)
router.post(
  '/request',
  protect,
  roleCheck(['student']),
  body('teacherId').isString().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const student = (req as any).user;
    const { teacherId } = req.body;
    try {
        const mongoose = require('mongoose');
        console.log('[connections.request] student:', String(student._id), 'payload.teacherId:', teacherId);
        const isValidId = mongoose.Types.ObjectId.isValid(teacherId);
        console.log('[connections.request] teacherId isValid:', isValidId);

        // allow either a raw teacher user id (ObjectId) or a short code stored on TeacherProfile.code
        let teacherUserId: string | null = null;
        if (isValidId) {
          // treat as userId
          const teacherExists = await TeacherProfile.findOne({ userId: teacherId });
          console.log('[connections.request] teacherExists by userId:', !!teacherExists);
          if (!teacherExists) return res.status(404).json({ message: 'Teacher not found by id' });
          teacherUserId = String(teacherId);
        } else {
          // treat as code
          const profile = await TeacherProfile.findOne({ code: teacherId });
          console.log('[connections.request] teacherProfile by code:', !!profile);
          if (!profile) return res.status(404).json({ message: 'Teacher not found by code' });
          teacherUserId = String(profile.userId);
        }

        const existing = await Connection.findOne({ teacher: teacherUserId, student: student._id });
        if (existing) return res.status(409).json({ message: 'Request already exists' });
        const conn = await Connection.create({ teacher: teacherUserId, student: student._id });
        console.log('[connections.request] created connection id:', conn._id);
        res.status(201).json(conn);
    } catch (err) {
        console.error('[connections.request] error:', err);
      res.status(500).json({ message: 'Failed to create connection request' });
    }
  }
);

export default router;
