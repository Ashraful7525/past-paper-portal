import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

class User {
  constructor({
    student_id,
    username,
    email,
    password,
    is_admin = false,
    profile = '',
    contribution = 0,
    created_at = new Date(),
    updated_at = new Date()
  }) {
    this.student_id = student_id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.is_admin = is_admin;
    this.profile = profile;
    this.contribution = contribution;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  // Static methods for database operations
  static async findById(student_id) {
    try {
      const query = 'SELECT * FROM users WHERE student_id = $1';
      const result = await pool.query(query, [student_id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw new Error('Database query failed');
    }
  }

  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      console.log('query likhlam');
      const result = await pool.query(query, [email]);
      
      if (result.rows.length === 0) {
        return null;
      }
      console.log('pool hoise');
      return new User(result.rows[0]);
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Database query failed');
    }
  }

  static async findByUsername(username) {
    try {
      const query = 'SELECT * FROM users WHERE username = $1';
      const result = await pool.query(query, [username]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw new Error('Database query failed');
    }
  }

  static async create(userData) {
    try {
      const {
        student_id,
        username,
        email,
        password,
        is_admin = false,
        profile = '',
        contribution = 0
      } = userData;

      // Hash password before storing
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const query = `
        INSERT INTO users (student_id, username, email, password, is_admin, profile, contribution, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *
      `;
      
      const values = [
        student_id,
        username,
        email,
        hashedPassword,
        is_admin,
        profile,
        contribution
      ];

      const result = await pool.query(query, values);
      return new User(result.rows[0]);
    } catch (error) {
      console.error('Error creating user:', error);
      
      // Handle unique constraint violations
      if (error.code === '23505') {
        if (error.constraint === 'users_email_key') {
          throw new Error('Email already exists');
        }
        if (error.constraint === 'users_username_key') {
          throw new Error('Username already exists');
        }
        if (error.constraint === 'users_student_id_key') {
          throw new Error('Student ID already exists');
        }
      }
      
      throw new Error('Failed to create user');
    }
  }

  static async findAll(limit = 50, offset = 0) {
    try {
      const query = `
        SELECT * FROM users 
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
      `;
      
      const result = await pool.query(query, [limit, offset]);
      return result.rows.map(row => new User(row));
    } catch (error) {
      console.error('Error finding all users:', error);
      throw new Error('Database query failed');
    }
  }

  static async count() {
    try {
      const query = 'SELECT COUNT(*) FROM users';
      const result = await pool.query(query);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error counting users:', error);
      throw new Error('Database query failed');
    }
  }

  // Instance methods
  async save() {
    try {
      const query = `
        UPDATE users 
        SET username = $1, email = $2, is_admin = $3, profile = $4, 
            contribution = $5, updated_at = NOW()
        WHERE student_id = $6
        RETURNING *
      `;
      
      const values = [
        this.username,
        this.email,
        this.is_admin,
        this.profile,
        this.contribution,
        this.student_id
      ];

      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      // Update current instance with returned data
      Object.assign(this, result.rows[0]);
      return this;
    } catch (error) {
      console.error('Error saving user:', error);
      throw new Error('Failed to save user');
    }
  }

  async delete() {
    try {
      const query = 'DELETE FROM users WHERE student_id = $1 RETURNING *';
      const result = await pool.query(query, [this.student_id]);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  async updatePassword(newPassword) {
    try {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      const query = `
        UPDATE users 
        SET password = $1, updated_at = NOW()
        WHERE student_id = $2
        RETURNING *
      `;
      
      const result = await pool.query(query, [hashedPassword, this.student_id]);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      this.password = hashedPassword;
      this.updated_at = result.rows[0].updated_at;
      return this;
    } catch (error) {
      console.error('Error updating password:', error);
      throw new Error('Failed to update password');
    }
  }

  async validatePassword(password) {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      console.error('Error validating password:', error);
      return false;
    }
  }

  updateContribution(points) {
    this.contribution += points;
    this.updated_at = new Date();
  }

  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

export default User;