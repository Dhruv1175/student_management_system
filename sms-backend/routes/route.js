import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
  getStudents, 
  getStudentById, 
  createStudent, 
  updateStudent, 
  deleteStudent 
} from '../controllers/studentController.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  }
});

router.get('/students', getStudents);
router.get('/students/:id', getStudentById);
router.post('/students', upload.single('photo'), createStudent);
router.put('/students/:id', upload.single('photo'), updateStudent);
router.delete('/students/:id', deleteStudent);

export default router;