// src/routes/licenseRoutes.ts
import { Router } from 'express';
import { handleLicensePing } from '../controllers/licenseController';

const router = Router();

router.get('/license/:project/:userId', handleLicensePing);

export default router;
