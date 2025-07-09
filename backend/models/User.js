// User model for future database integration
class User {
  constructor({
    student_id,
    username,
    email,
    is_admin = false,
    profile = '',
    contribution = 0,
    created_at = new Date(),
    updated_at = new Date()
  }) {
    this.student_id = student_id;
    this.username = username;
    this.email = email;
    this.is_admin = is_admin;
    this.profile = profile;
    this.contribution = contribution;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  // Static methods for future database operations
  static async findById(student_id) {
    // This will be implemented when connecting to the database
    throw new Error('Database not implemented yet');
  }

  static async findByEmail(email) {
    // This will be implemented when connecting to the database
    throw new Error('Database not implemented yet');
  }

  static async create(userData) {
    // This will be implemented when connecting to the database
    throw new Error('Database not implemented yet');
  }

  // Instance methods
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  updateContribution(points) {
    this.contribution += points;
    this.updated_at = new Date();
  }
}

export default User;
