import sql from './db.js';

const createTableQuery = `
CREATE TABLE IF NOT EXISTS students(

    id SERIAL PRIMARY KEY,
    admission_number VARCHAR(20) NOT NULL UNIQUE,
    photo VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    course VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    gender VARCHAR(10) NOT NULL,
    address TEXT NOT NULL
)`;
const createNameIndexQuery = `CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);`;
const createCourseIndexQuery = `CREATE INDEX IF NOT EXISTS idx_students_course ON students(course);`;
const createActivityLogQuery = `
  CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,       -- 'CREATE', 'UPDATE', 'DELETE'
    student_id INT,                    -- The ID of the student impacted
    details TEXT,                      -- Description (e.g., "Updated email address")
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const initializeSchema = async () => {
    try {
        await sql`${sql.unsafe(createTableQuery)}`;
        await sql`${sql.unsafe(createNameIndexQuery)}`;
        await sql`${sql.unsafe(createCourseIndexQuery)}`;
        await sql`${sql.unsafe(createActivityLogQuery)}`;
        console.log("Database schema initialized successfully.");
    } catch (error) {
        console.error("Error initializing database schema:", error);
    }
};

initializeSchema();