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

// User responds to connection (both teachers and students can accept/reject)
router.patch('/invite/:id/respond', protect, async (req, res) => {
  const user = (req as any).user;
  const { id } = req.params;
  const { action } = req.body; // 'accept' | 'reject'
  
  if (!['accept', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action. Must be accept or reject' });
  }
  
  try {
    const conn = await Connection.findById(id);
    if (!conn) {
      return res.status(404).json({ message: 'Connection not found' });
    }
    
    // Check if user is either the teacher or student in this connection
    const isTeacher = String(conn.teacher) === String(user._id);
    const isStudent = String(conn.student) === String(user._id);
    
    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: 'Only involved parties can respond to this connection' });
    }

    if (conn.status !== 'pending') {
      return res.status(400).json({ message: `Connection is already ${conn.status}` });
    }

    conn.status = action === 'accept' ? 'accepted' : 'rejected';
    await conn.save();

    if (action === 'accept') {
      // Update profiles to reflect accepted connection
      await Promise.all([
        TeacherProfile.updateOne(
          { userId: conn.teacher },
          { $addToSet: { connectedStudents: conn.student } }
        ),
        StudentProfile.updateOne(
          { userId: conn.student },
          { $addToSet: { connectedTeachers: conn.teacher } }
        )
      ]);
    }

    const populated = await Connection.findById(conn._id)
      .populate('teacher', 'name email')
      .populate('student', 'name email');
    res.json(populated);
  } catch (err) {
    console.error('[connections.respond] error:', err);
    res.status(500).json({ message: 'Failed to respond to invite' });
  }
});

// List pending connections for user
router.get('/pending', protect, async (req, res) => {
  const user = (req as any).user;
  try {
    let list;
    if (user.role === 'teacher') {
      // Teachers see pending requests from students
      list = await Connection.find({ teacher: user._id, status: 'pending' })
        .populate('student', 'name email')
        .sort({ createdAt: -1 });
    } else {
      // Students see pending invites from teachers
      list = await Connection.find({ student: user._id, status: 'pending' })
        .populate('teacher', 'name email')
        .sort({ createdAt: -1 });
    }
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pending connections' });
  }
});

// List accepted connections for user
router.get('/accepted', protect, async (req, res) => {
  const user = (req as any).user;
  try {
    let list;
    if (user.role === 'teacher') {
      // Teachers see their connected students
      list = await Connection.find({ teacher: user._id, status: 'accepted' })
        .populate('student', 'name email')
        .sort({ createdAt: -1 });
    } else {
      // Students see their connected teachers
      list = await Connection.find({ student: user._id, status: 'accepted' })
        .populate('teacher', 'name email')
        .sort({ createdAt: -1 });
    }
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch accepted connections' });
  }
});

// List all connections for user (both pending and accepted)
router.get('/', protect, async (req, res) => {
  const user = (req as any).user;
  try {
    let list;
    if (user.role === 'teacher') {
      list = await Connection.find({ teacher: user._id })
        .populate('student', 'name email')
        .sort({ createdAt: -1 });
    } else {
      list = await Connection.find({ student: user._id })
        .populate('teacher', 'name email')
        .sort({ createdAt: -1 });
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
      
      // allow either a raw teacher user id (ObjectId) or a short code stored on TeacherProfile.code
      let teacherUserId: string | null = null;
      if (mongoose.Types.ObjectId.isValid(teacherId)) {
        // treat as userId
        const teacherExists = await TeacherProfile.findOne({ userId: teacherId });
        if (!teacherExists) return res.status(404).json({ message: 'Teacher not found' });
        teacherUserId = String(teacherId);
      } else {
        // treat as code
        const profile = await TeacherProfile.findOne({ code: teacherId });
        if (!profile) return res.status(404).json({ message: 'Teacher code not found' });
        teacherUserId = String(profile.userId);
      }

      // Check if student is trying to connect with themselves
      if (String(student._id) === String(teacherUserId)) {
        return res.status(400).json({ message: 'Cannot connect with yourself' });
      }

      // Check if connection already exists (pending or accepted)
      const existing = await Connection.findOne({ teacher: teacherUserId, student: student._id });
      if (existing) {
        return res.status(409).json({ 
          message: 'Connection already exists',
          status: existing.status 
        });
      }

      const conn = await Connection.create({ teacher: teacherUserId, student: student._id });
      const populated = await Connection.findById(conn._id).populate('teacher', 'name email');
      res.status(201).json(populated);
    } catch (err) {
      console.error('[connections.request] error:', err);
      res.status(500).json({ message: 'Failed to create connection request' });
    }
  }
);

export default router;
