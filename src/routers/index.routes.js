import { Router } from 'express';
import studentsRouter from '../routers/students.routes.js';
import authRouter from '../routers/auth.routes.js';

const router = Router();

router.use('/students', studentsRouter);
router.use('/register', authRouter);

export default router;

// {
//     "name": "Charlotte Lee",
//     "email": "test@gmail.com",
//     "password": "123456789"
//   }
