import db from '../config/db.js';

class CoursesController {
  // Get all courses with department info
  async getCourses(req, res) {
    try {
      const query = `
        SELECT 
          c.course_id,
          c.course_code,
          c.course_title,
          c.department_id,
          d.department_name,
          d.icon as department_icon
        FROM courses c
        JOIN departments d ON c.department_id = d.department_id
        ORDER BY d.department_name, c.course_title
      `;
      
      const result = await db.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ message: 'Failed to fetch courses' });
    }
  }

  // Get courses by department
  async getCoursesByDepartment(req, res) {
    try {
      const { department_id } = req.params;
      
      const query = `
        SELECT 
          c.course_id,
          c.course_code,
          c.course_title,
          c.department_id,
          d.department_name,
          d.icon as department_icon
        FROM courses c
        JOIN departments d ON c.department_id = d.department_id
        WHERE c.department_id = $1
        ORDER BY c.course_title
      `;
      
      const result = await db.query(query, [department_id]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching courses by department:', error);
      res.status(500).json({ message: 'Failed to fetch courses' });
    }
  }

  // Get user's current enrollments
  async getMyEnrollments(req, res) {
    try {
      const studentId = req.user.student_id;
      
      const query = `
        SELECT 
          e.enrollment_id,
          e.enrolled_at,
          e.is_currently_enrolled,
          c.course_id,
          c.course_code,
          c.course_title,
          d.department_id,
          d.department_name,
          d.icon as department_icon
        FROM enrollments e
        JOIN courses c ON e.course_id = c.course_id
        JOIN departments d ON c.department_id = d.department_id
        WHERE e.student_id = $1 AND e.is_currently_enrolled = true
        ORDER BY d.department_name, c.course_title
      `;
      
      const result = await db.query(query, [studentId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching user enrollments:', error);
      res.status(500).json({ message: 'Failed to fetch enrollments' });
    }
  }

  // Enroll in a course
  async enrollInCourse(req, res) {
    try {
      const studentId = req.user.student_id;
      const { course_id } = req.body;

      if (!course_id) {
        return res.status(400).json({ message: 'Course ID is required' });
      }

      // Check if already enrolled
      const existingEnrollment = await db.query(
        'SELECT enrollment_id, is_currently_enrolled FROM enrollments WHERE student_id = $1 AND course_id = $2',
        [studentId, course_id]
      );

      if (existingEnrollment.rows.length > 0) {
        const enrollment = existingEnrollment.rows[0];
        if (enrollment.is_currently_enrolled) {
          return res.status(400).json({ message: 'Already enrolled in this course' });
        } else {
          // Re-enroll (update existing record)
          await db.query(
            'UPDATE enrollments SET is_currently_enrolled = true, enrolled_at = NOW() WHERE enrollment_id = $1',
            [enrollment.enrollment_id]
          );
          return res.json({ message: 'Successfully re-enrolled in course' });
        }
      }

      // Create new enrollment
      await db.query(
        'INSERT INTO enrollments (student_id, course_id, is_currently_enrolled, enrolled_at) VALUES ($1, $2, true, NOW())',
        [studentId, course_id]
      );

      res.json({ message: 'Successfully enrolled in course' });
    } catch (error) {
      console.error('Error enrolling in course:', error);
      res.status(500).json({ message: 'Failed to enroll in course' });
    }
  }

  // Drop a course
  async dropCourse(req, res) {
    try {
      const studentId = req.user.student_id;
      const { enrollment_id } = req.params;

      // Verify the enrollment belongs to the user
      const result = await db.query(
        'UPDATE enrollments SET is_currently_enrolled = false WHERE enrollment_id = $1 AND student_id = $2 RETURNING enrollment_id',
        [enrollment_id, studentId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Enrollment not found or unauthorized' });
      }

      res.json({ message: 'Successfully dropped course' });
    } catch (error) {
      console.error('Error dropping course:', error);
      res.status(500).json({ message: 'Failed to drop course' });
    }
  }
}

export default new CoursesController();
