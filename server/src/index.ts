import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import foodsRouter from './routes/foods';
import diaryRouter from './routes/diary';
import './db';

dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3001;
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(express.json());
app.use(
  cors({
    origin: clientOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api/foods', foodsRouter);
app.use('/api/diary', diaryRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'An unexpected error occurred' });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
