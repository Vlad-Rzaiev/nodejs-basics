import express, { Router } from 'express';
import {
  createStudentController,
  deleteStudentController,
  getStudentByIdController,
  getStudentsController,
  patchStudentController,
  upsertStudentController,
} from '../controllers/students.controller.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();
const jsonParser = express.json();

router.get('/students', ctrlWrapper(getStudentsController));

router.get('/students/:studentId', ctrlWrapper(getStudentByIdController));

router.post('/students', jsonParser, ctrlWrapper(createStudentController));

router.delete(
  '/students/:studentId',
  jsonParser,
  ctrlWrapper(deleteStudentController),
);

router.put(
  '/students/:studentId',
  jsonParser,
  ctrlWrapper(upsertStudentController),
);

router.patch(
  '/students/:studentId',
  jsonParser,
  ctrlWrapper(patchStudentController),
);

export default router;
