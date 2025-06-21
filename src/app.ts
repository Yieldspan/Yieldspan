import express from 'express';
import allocationRoute from './routes/allocation';

const app = express();
app.use(express.json());
app.use(allocationRoute);

export default app;
