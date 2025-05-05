import express from 'express';
import pino from 'pino-http';
import cors from 'cors';

const PORT = 7777;

export const startServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.use((req, res, next) => {
    console.log(`Time: ${new Date().toLocaleString()}`);
    next();
  });

  app.get('/', (req, res) => {
    res.json({
      message: 'Hello World',
    });
  });

  app.get('/error', (req, res) => {
    throw new Error('This is the test error');
  });

  app.use((req, res, next) => {
    res.status(404).json({
      message: 'Requested resource could not be found. 😐',
    });
  });

  app.use((err, req, res, next) => {
    res.status(500).json({
      message: 'Something went wrong',
      error: err.message,
      name: err.name,
      stack: err.stack,
    });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
