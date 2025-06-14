// src/app.ts
import express from 'express';
import licenseRoutes from './routes/licenseRoutes';

const app = express();

app.set('trust proxy', true);

app.use(express.json());
app.use('/api', licenseRoutes); 

export default app;
