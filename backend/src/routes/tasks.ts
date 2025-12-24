import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth';
import Task from '../models/Task';
import TeacherProfile from '../models/TeacherProfile';
import StudentProfile from '../models/StudentProfile';

const router = express.Router();

// Teacher assigns a task to multiple students
router.post(
  '/assign',
  protect,
  body('title').isString().notEmpty(),
  body('assignedTo').isArray({ min: 1 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const user = (req as any).user;
    const { title, description, dueDate, priority, assignedTo } = req.body;
    try {
      if (user.role !== 'teacher') return res.status(403).json({ message: 'Only teachers can assign tasks' });

      const created: any[] = [];
      for (const studentId of assignedTo) {
        const task = await Task.create({
          title,
          description,
          dueDate,
          priority,
          assignedBy: user._id,
          assignedTo: studentId
        });
        created.push(task);

        // update profiles
        await TeacherProfile.updateOne({ userId: user._id }, { $addToSet: { assignedTasks: task._id } });
        await StudentProfile.updateOne({ userId: studentId }, { $addToSet: { assignedTasks: task._id } });
      }

      res.status(201).json({ tasks: created });
    } catch (err) {
      console.error('Assign tasks error:', err);
      res.status(500).json({ message: 'Failed to assign tasks' });
    }
  }
);

// Create task
router.post(
  '/',
  protect,
  body('title').isString().notEmpty(),
  body('assignedTo').optional().isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const user = (req as any).user;
    let { title, description, dueDate, priority, assignedTo } = req.body;
    try {
      // Default assignedTo for students to themselves when omitted
      if (user.role === 'student') {
        assignedTo = assignedTo || String(user._id);
        if (String(assignedTo) !== String(user._id)) {
          return res.status(403).json({ message: 'Students may only create tasks for themselves' });
        }
      } else {
        // teacher must provide assignedTo
        if (!assignedTo) return res.status(400).json({ message: 'assignedTo is required when teacher creates a task' });
      }

      const task = await Task.create({
        title,
        description,
        dueDate,
        priority,
        assignedBy: user._id,
        assignedTo
      });

      // link to profiles
      if (user.role === 'teacher') {
        await TeacherProfile.updateOne({ userId: user._id }, { $push: { assignedTasks: task._id } });
      } else {
        await StudentProfile.updateOne({ userId: user._id }, { $push: { selfTasks: task._id } });
      }

      res.status(201).json(task);
    } catch (err) {
      console.error('Create task error:', err);
      res.status(500).json({ message: 'Failed to create task' });
    }
  }
);

// Get tasks (paginated)
router.get('/', protect, async (req, res) => {
  const user = (req as any).user;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;
  try {
    let filter: any = {};
    if (user.role === 'teacher') filter.assignedBy = user._id;
    else filter.assignedTo = user._id;
    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    res.json({ page, limit, total, tasks });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

// Update task (status or fields)
router.put('/:id', protect, async (req, res) => {
  const user = (req as any).user;
  const { id } = req.params;
  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    // Only teacher who assigned or student who is assigned can modify
    if (String(task.assignedBy) !== String(user._id) && String(task.assignedTo) !== String(user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    // Apply updates
    const updates = req.body;
    Object.assign(task, updates);
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', protect, async (req, res) => {
  const user = (req as any).user;
  const { id } = req.params;
  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (String(task.assignedBy) !== String(user._id) && String(task.assignedTo) !== String(user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await Task.deleteOne({ _id: id });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task' });
  }
});

export default router;
