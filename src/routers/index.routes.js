import { Router } from 'express';
import studentsRouter from '../routers/students.routes.js';
import authRouter from '../routers/auth.routes.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/students', studentsRouter);

export default router;
