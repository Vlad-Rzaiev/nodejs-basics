import { Router } from 'express';
import studentsRouter from '../routers/students.routes.js';
import authRouter from '../routers/auth.routes.js';

const router = Router();

router.use('/students', studentsRouter);
router.use('/auth', authRouter);

export default router;
