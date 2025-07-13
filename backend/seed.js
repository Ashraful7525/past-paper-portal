import db from './config/db.js';

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Insert departments if they don't exist
    const departments = [
      { name: 'Computer Science & Engineering', icon: '💻' },
      { name: 'Electrical & Electronic Engineering', icon: '⚡' },
      { name: 'Mechanical Engineering', icon: '⚙️' },
      { name: 'Civil Engineering', icon: '🏗️' },
      { name: 'Business Administration', icon: '💼' },
      { name: 'Mathematics', icon: '📐' },
      { name: 'Physics', icon: '🔬' },
      { name: 'Chemistry', icon: '🧪' }
    ];

    for (const dept of departments) {
      await db.query(
        `INSERT INTO departments (department_name, icon) 
         VALUES ($1, $2) 
         ON CONFLICT (department_name) DO UPDATE SET icon = EXCLUDED.icon`,
        [dept.name, dept.icon]
      );
    }
    console.log('✅ Departments seeded');

    // Get department IDs
    const deptResult = await db.query('SELECT department_id, department_name FROM departments');
    const deptMap = {};
    deptResult.rows.forEach(dept => {
      deptMap[dept.department_name] = dept.department_id;
    });

    // Insert courses if they don't exist
    const courses = [
      // Computer Science & Engineering
      { code: 'CSE101', title: 'Introduction to Programming', dept: 'Computer Science & Engineering' },
      { code: 'CSE201', title: 'Data Structures and Algorithms', dept: 'Computer Science & Engineering' },
      { code: 'CSE301', title: 'Database Management Systems', dept: 'Computer Science & Engineering' },
      { code: 'CSE401', title: 'Software Engineering', dept: 'Computer Science & Engineering' },
      { code: 'CSE501', title: 'Machine Learning', dept: 'Computer Science & Engineering' },

      // Electrical & Electronic Engineering
      { code: 'EEE101', title: 'Circuit Analysis', dept: 'Electrical & Electronic Engineering' },
      { code: 'EEE201', title: 'Digital Logic Design', dept: 'Electrical & Electronic Engineering' },
      { code: 'EEE301', title: 'Microprocessors', dept: 'Electrical & Electronic Engineering' },
      { code: 'EEE401', title: 'Control Systems', dept: 'Electrical & Electronic Engineering' },

      // Mechanical Engineering
      { code: 'ME101', title: 'Engineering Mechanics', dept: 'Mechanical Engineering' },
      { code: 'ME201', title: 'Thermodynamics', dept: 'Mechanical Engineering' },
      { code: 'ME301', title: 'Fluid Mechanics', dept: 'Mechanical Engineering' },
      { code: 'ME401', title: 'Machine Design', dept: 'Mechanical Engineering' },

      // Civil Engineering
      { code: 'CE101', title: 'Engineering Drawing', dept: 'Civil Engineering' },
      { code: 'CE201', title: 'Structural Analysis', dept: 'Civil Engineering' },
      { code: 'CE301', title: 'Concrete Technology', dept: 'Civil Engineering' },
      { code: 'CE401', title: 'Highway Engineering', dept: 'Civil Engineering' },

      // Business Administration
      { code: 'BBA101', title: 'Principles of Management', dept: 'Business Administration' },
      { code: 'BBA201', title: 'Financial Accounting', dept: 'Business Administration' },
      { code: 'BBA301', title: 'Marketing Management', dept: 'Business Administration' },
      { code: 'BBA401', title: 'Strategic Management', dept: 'Business Administration' },

      // Mathematics
      { code: 'MATH101', title: 'Calculus I', dept: 'Mathematics' },
      { code: 'MATH201', title: 'Linear Algebra', dept: 'Mathematics' },
      { code: 'MATH301', title: 'Differential Equations', dept: 'Mathematics' },

      // Physics
      { code: 'PHY101', title: 'Classical Mechanics', dept: 'Physics' },
      { code: 'PHY201', title: 'Electromagnetism', dept: 'Physics' },
      { code: 'PHY301', title: 'Quantum Mechanics', dept: 'Physics' },

      // Chemistry
      { code: 'CHEM101', title: 'General Chemistry', dept: 'Chemistry' },
      { code: 'CHEM201', title: 'Organic Chemistry', dept: 'Chemistry' },
      { code: 'CHEM301', title: 'Physical Chemistry', dept: 'Chemistry' }
    ];

    for (const course of courses) {
      const deptId = deptMap[course.dept];
      if (deptId) {
        await db.query(
          `INSERT INTO courses (course_code, course_title, department_id) 
           VALUES ($1, $2, $3) 
           ON CONFLICT (course_code) DO UPDATE SET 
           course_title = EXCLUDED.course_title,
           department_id = EXCLUDED.department_id`,
          [course.code, course.title, deptId]
        );
      }
    }
    console.log('✅ Courses seeded');

    // Insert semesters if they don't exist
    const semesters = [
      { level: 1, term: 1, name: 'Level 1 Term 1' },
      { level: 1, term: 2, name: 'Level 1 Term 2' },
      { level: 2, term: 1, name: 'Level 2 Term 1' },
      { level: 2, term: 2, name: 'Level 2 Term 2' },
      { level: 3, term: 1, name: 'Level 3 Term 1' },
      { level: 3, term: 2, name: 'Level 3 Term 2' },
      { level: 4, term: 1, name: 'Level 4 Term 1' },
      { level: 4, term: 2, name: 'Level 4 Term 2' }
    ];

    for (const semester of semesters) {
      await db.query(
        `INSERT INTO semesters (level, term, semester_name) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (level, term) DO UPDATE SET 
         semester_name = EXCLUDED.semester_name`,
        [semester.level, semester.term, semester.name]
      );
    }
    console.log('✅ Semesters seeded');

    console.log('🎉 Database seeding completed successfully!');
    
    // Show summary
    const summary = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM departments) as departments_count,
        (SELECT COUNT(*) FROM courses) as courses_count,
        (SELECT COUNT(*) FROM semesters) as semesters_count
    `);
    
    console.log('📊 Database Summary:');
    console.log(`   - Departments: ${summary.rows[0].departments_count}`);
    console.log(`   - Courses: ${summary.rows[0].courses_count}`);
    console.log(`   - Semesters: ${summary.rows[0].semesters_count}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    process.exit(0);
  }
};

seedData();
