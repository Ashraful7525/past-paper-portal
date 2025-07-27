import pool from '../config/db.js';

class Question {
  constructor({
    question_id,
    question_title,
    question_text,
    question_no,
    year,
    course_id,
    semester_id,
    uploaded_by,
    is_verified = false,
    views = 0,
    created_at = new Date(),
    updated_at = new Date()
  }) {
    this.question_id = question_id;
    this.question_title = question_title;
    this.question_text = question_text;
    this.question_no = question_no;
    this.year = year;
    this.course_id = course_id;
    this.semester_id = semester_id;
    this.uploaded_by = uploaded_by;
    this.is_verified = is_verified;
    this.views = views;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  // Get pending questions for admin moderation
  static async getPendingQuestions(status = 'pending', limit = 20, offset = 0) {
    const client = await pool.connect();
    try {
      let whereClause = '';
      const queryParams = [limit, offset];
      
      if (status === 'pending') {
        whereClause = 'WHERE p.is_verified = false';
      }
      
      const query = `
        SELECT 
          p.post_id as id,
          p.title as title,
          p.content as content,
          p.is_verified,
          p.created_at,
          u.username as author,
          d.department_name as department,
          p.upvotes,
          p.downvotes,
          p.view_count
        FROM public.posts p
        LEFT JOIN public.users u ON p.student_id = u.student_id
        LEFT JOIN public.departments d ON p.department_id = d.department_id
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      
      const result = await client.query(query, queryParams);
      
      return result.rows.map(row => ({
        ...row,
        createdAt: new Date(row.created_at).toLocaleDateString()
      }));
    } catch (error) {
      console.error('Error fetching pending questions:', error);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }

  // Approve a question
  static async approveQuestion(questionId) {
    const client = await pool.connect();
    try {
      const query = `
        UPDATE public.posts 
        SET is_verified = true, updated_at = NOW()
        WHERE post_id = $1
        RETURNING post_id, is_verified
      `;
      
      const result = await client.query(query, [questionId]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error approving question:', error);
      throw new Error('Database update failed');
    } finally {
      client.release();
    }
  }

  // Delete a question and all related data
  static async deleteQuestion(questionId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Delete related data first (cascade delete)
      await client.query('DELETE FROM public.post_votes WHERE post_id = $1', [questionId]);
      await client.query('DELETE FROM public.saved_posts WHERE post_id = $1', [questionId]);
      await client.query('DELETE FROM public.post_tags WHERE post_id = $1', [questionId]);
      
      // Delete the post
      const result = await client.query(
        'DELETE FROM public.posts WHERE post_id = $1 RETURNING post_id',
        [questionId]
      );
      
      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting question:', error);
      throw new Error('Database delete failed');
    } finally {
      client.release();
    }
  }

  // Find question by ID
  static async findById(questionId) {
    const client = await pool.connect();
    try {
      const query = 'SELECT * FROM public.questions WHERE question_id = $1';
      const result = await client.query(query, [questionId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new Question(result.rows[0]);
    } catch (error) {
      console.error('Error finding question by ID:', error);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }

  // Create new question
  static async create(questionData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const {
        question_title,
        question_text,
        question_no,
        year,
        course_id,
        semester_id,
        uploaded_by
      } = questionData;

      const insertQuery = `
        INSERT INTO public.questions (
          question_title, question_text, question_no, year, 
          course_id, semester_id, uploaded_by, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *
      `;

      const result = await client.query(insertQuery, [
        question_title, question_text, question_no, year,
        course_id, semester_id, uploaded_by
      ]);

      await client.query('COMMIT');
      return new Question(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating question:', error);
      throw new Error('Database insert failed');
    } finally {
      client.release();
    }
  }

  // Get all questions with filters
  static async getAll(filters = {}) {
    const client = await pool.connect();
    try {
      const {
        course_id,
        semester_id,
        year,
        is_verified,
        limit = 50,
        offset = 0
      } = filters;

      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      if (course_id) {
        whereConditions.push(`q.course_id = $${paramIndex}`);
        queryParams.push(course_id);
        paramIndex++;
      }

      if (semester_id) {
        whereConditions.push(`q.semester_id = $${paramIndex}`);
        queryParams.push(semester_id);
        paramIndex++;
      }

      if (year) {
        whereConditions.push(`q.year = $${paramIndex}`);
        queryParams.push(year);
        paramIndex++;
      }

      if (typeof is_verified === 'boolean') {
        whereConditions.push(`q.is_verified = $${paramIndex}`);
        queryParams.push(is_verified);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      queryParams.push(limit, offset);

      const query = `
        SELECT 
          q.*,
          u.username as uploaded_by_username,
          c.course_title,
          d.department_name,
          s.semester_name
        FROM public.questions q
        LEFT JOIN public.users u ON q.uploaded_by = u.student_id
        LEFT JOIN public.courses c ON q.course_id = c.course_id
        LEFT JOIN public.departments d ON c.department_id = d.department_id
        LEFT JOIN public.semesters s ON q.semester_id = s.semester_id
        ${whereClause}
        ORDER BY q.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const result = await client.query(query, queryParams);
      return result.rows.map(row => new Question(row));
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw new Error('Database query failed');
    } finally {
      client.release();
    }
  }

  // Instance method to save changes
  async save() {
    const client = await pool.connect();
    try {
      const query = `
        UPDATE public.questions 
        SET question_title = $1, question_text = $2, question_no = $3,
            year = $4, course_id = $5, semester_id = $6, is_verified = $7,
            updated_at = NOW()
        WHERE question_id = $8
        RETURNING *
      `;

      const result = await client.query(query, [
        this.question_title,
        this.question_text,
        this.question_no,
        this.year,
        this.course_id,
        this.semester_id,
        this.is_verified,
        this.question_id
      ]);

      if (result.rows.length > 0) {
        Object.assign(this, result.rows[0]);
      }

      return this;
    } catch (error) {
      console.error('Error saving question:', error);
      throw new Error('Database update failed');
    } finally {
      client.release();
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      question_id: this.question_id,
      question_title: this.question_title,
      question_text: this.question_text,
      question_no: this.question_no,
      year: this.year,
      course_id: this.course_id,
      semester_id: this.semester_id,
      uploaded_by: this.uploaded_by,
      is_verified: this.is_verified,
      views: this.views,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

export default Question;
