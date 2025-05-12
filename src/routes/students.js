import { Router } from 'express';
import {
  createStudentController,
  getStudentByIdController,
  getStudentsController,
} from '../controllers/students.controller.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

router.get('/students', ctrlWrapper(getStudentsController));

router.get('/students/:studentId', ctrlWrapper(getStudentByIdController));

router.post('/students', ctrlWrapper(createStudentController));

export default router;
