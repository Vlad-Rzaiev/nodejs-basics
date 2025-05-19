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
import { validateBody } from '../middlewares/validateBody.js';
import {
  createStudentsSchema,
  updateStudentsSchema,
} from '../validation/students.js';
import { isValidId } from '../middlewares/isValidId.js';

const router = Router();
const jsonParser = express.json();

router.get('/students', ctrlWrapper(getStudentsController));

router.get(
  '/students/:studentId',
  isValidId,
  ctrlWrapper(getStudentByIdController),
);

router.post(
  '/students',
  jsonParser,
  validateBody(createStudentsSchema),
  ctrlWrapper(createStudentController),
);

router.delete('/students/:studentId', ctrlWrapper(deleteStudentController));

router.put(
  '/students/:studentId',
  isValidId,
  jsonParser,
  validateBody(createStudentsSchema),
  ctrlWrapper(upsertStudentController),
);

router.patch(
  '/students/:studentId',
  isValidId,
  jsonParser,
  validateBody(updateStudentsSchema),
  ctrlWrapper(patchStudentController),
);

export default router;
