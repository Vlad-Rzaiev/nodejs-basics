import express, { Router } from 'express';
import { validateBody } from '../middlewares/validateBody.js';
import { registerUserSchema } from '../validation/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { registerUserController } from '../controllers/auth.controller.js';

const router = Router();
const jsonParser = express.json();

router.post(
  '/',
  jsonParser,
  validateBody(registerUserSchema),
  ctrlWrapper(registerUserController),
);

export default router;
