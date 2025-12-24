import express from 'express';
import { protect, roleCheck } from '../middleware/auth';
import User from '../models/User';
import StudentProfile from '../models/StudentProfile';

const router = express.Router();

// Get list of all students (for teachers to search/invite)
router.get('/', protect, roleCheck(['teacher']), async (req, res) => {
  try {
    const { search, page = '1', limit = '50' } = req.query;
    
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build search filter
    let filter: any = { role: 'student' };
    if (search && typeof search === 'string') {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count and students
    const total = await User.countDocuments(filter);
    const students = await User.find(filter)
      .select('_id name email createdAt') // Exclude password and other sensitive fields
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Optionally enrich with student profile data
    const enrichedStudents = await Promise.all(
      students.map(async (student) => {
        const profile = await StudentProfile.findOne({ userId: student._id })
          .select('connectedTeachers')
          .lean();
        
        return {
          ...student,
          hasProfile: !!profile,
          connectedTeachersCount: profile?.connectedTeachers?.length || 0
        };
      })
    );

    res.json({
      page: pageNum,
      limit: limitNum,
      total,
      students: enrichedStudents
    });
  } catch (err) {
    console.error('[students.list] error:', err);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

export default router;
