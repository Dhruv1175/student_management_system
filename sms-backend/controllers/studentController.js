import sql from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateAdmissionNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `ADM-${year}-${random}`;
}

function deletePhoto(filename) {
  if (!filename) return;
  const filePath = path.join(__dirname, '../uploads', filename);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') console.error('Delete photo error:', err);
  });
}

export const createStudent = async (req, res) => {
  try {
    const { name, course, date_of_birth, email, phone_number, gender, address } = req.body;
    let admissionNumber;
    let attempts = 0;
    let unique = false;
    while (!unique && attempts < 5) {
      admissionNumber = generateAdmissionNumber();
      const existing = await sql`SELECT id FROM students WHERE admission_number = ${admissionNumber}`;
      if (existing.length === 0) unique = true;
      attempts++;
    }
    if (!unique) {
      return res.status(500).json({ success: false, message: 'Failed to generate unique admission number' });
    }

    const photo = req.file ? req.file.filename : null;

    const result = await sql.begin(async (sql) => {
      const [newStudent] = await sql`
        INSERT INTO students 
          (name, course, date_of_birth, email, phone_number, gender, address, admission_number, photo)
        VALUES 
          (${name}, ${course}, ${date_of_birth}, ${email}, ${phone_number}, ${gender}, ${address}, ${admissionNumber}, ${photo})
        RETURNING *
      `;
      await sql`
        INSERT INTO activity_logs (action, student_id, details)
        VALUES ('CREATE', ${newStudent.id}, ${`Created record for ${name} (${email})`})
      `;
      return newStudent;
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.error('Create student error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { search, course } = req.query;

    const searchClause = search ? sql`AND name ILIKE ${'%' + search + '%'}` : sql``;
    const courseClause = course ? sql`AND course = ${course}` : sql``;

    const students = await sql`
      SELECT * FROM students 
      WHERE 1=1 ${searchClause} ${courseClause} 
      ORDER BY id DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [countResult] = await sql`
      SELECT COUNT(*) FROM students 
      WHERE 1=1 ${searchClause} ${courseClause}
    `;
    const totalItems = parseInt(countResult.count);

    res.status(200).json({
      success: true,
      data: students,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        itemsPerPage: limit
      }
    });
  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await sql`SELECT * FROM students WHERE id = ${id}`;
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, data: student[0] });
  } catch (err) {
    console.error('Get student by id error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, course, date_of_birth, email, phone_number, gender, address } = req.body;
    const newPhoto = req.file ? req.file.filename : null;

    const result = await sql.begin(async (sql) => {
      const [current] = await sql`SELECT photo FROM students WHERE id = ${id}`;
      const oldPhoto = current?.photo;

      let updateQuery = sql`
        UPDATE students 
        SET name = ${name}, course = ${course}, date_of_birth = ${date_of_birth}, 
            email = ${email}, phone_number = ${phone_number}, gender = ${gender}, address = ${address}
      `;
      if (newPhoto) {
        updateQuery = sql`${updateQuery}, photo = ${newPhoto}`;
      }
      updateQuery = sql`${updateQuery} WHERE id = ${id} RETURNING *`;

      const [updatedStudent] = await updateQuery;
      if (!updatedStudent) return null;

      if (oldPhoto && newPhoto) {
        deletePhoto(oldPhoto);
      }

      await sql`
        INSERT INTO activity_logs (action, student_id, details)
        VALUES ('UPDATE', ${id}, ${`Updated student: ${name}`})
      `;

      return updatedStudent;
    });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Update student error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await sql.begin(async (sql) => {
      const [student] = await sql`SELECT name, photo FROM students WHERE id = ${id}`;
      if (!student) return null;

      if (student.photo) {
        deletePhoto(student.photo);
      }

      await sql`DELETE FROM students WHERE id = ${id}`;

      await sql`
        INSERT INTO activity_logs (action, student_id, details)
        VALUES ('DELETE', ${id}, ${`Deleted student: ${student.name}`})
      `;

      return student;
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    console.error('Delete student error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};