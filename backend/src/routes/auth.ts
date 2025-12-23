import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import StudentProfile from '../models/StudentProfile';
import TeacherProfile from '../models/TeacherProfile';
import crypto from 'crypto';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || '';

// Register
router.post(
  '/register',
  body('name').isString().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['student', 'teacher']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, email, password, role } = req.body;
    try {
      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ message: 'Email already in use' });
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashed, role });
      // create profile
      if (role === 'student') {
        await StudentProfile.create({ userId: user._id });
      } else {
        // generate short invite code (6 uppercase alnum)
        const code = crypto.randomBytes(4).toString('hex').slice(0,6).toUpperCase();
        await TeacherProfile.create({ userId: user._id, code });
      }
      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      res.status(500).json({ message: 'Registration failed' });
    }
  }
);

// Login
router.post(
  '/login',
  body('email').isEmail(),
  body('password').isString().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ message: 'Invalid credentials' });
      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      res.status(500).json({ message: 'Login failed' });
    }
  }
);

export default router;
