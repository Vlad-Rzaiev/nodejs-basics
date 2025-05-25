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
} from '../validation/student.js';
import { isValidId } from '../middlewares/isValidId.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();
const jsonParser = express.json();

router.use(authenticate);

router.get('/', ctrlWrapper(getStudentsController));

router.get('/:studentId', isValidId, ctrlWrapper(getStudentByIdController));

router.post(
  '/',
  jsonParser,
  validateBody(createStudentsSchema),
  ctrlWrapper(createStudentController),
);

router.delete('/:studentId', isValidId, ctrlWrapper(deleteStudentController));

router.put(
  '/:studentId',
  isValidId,
  jsonParser,
  validateBody(createStudentsSchema),
  ctrlWrapper(upsertStudentController),
);

router.patch(
  '/:studentId',
  isValidId,
  jsonParser,
  validateBody(updateStudentsSchema),
  ctrlWrapper(patchStudentController),
);

export default router;
