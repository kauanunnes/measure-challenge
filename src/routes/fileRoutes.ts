// src/routes/fileRoutes.ts
import { Router } from 'express';
import { fileController } from '../controllers/fileController';

const router = Router();

// Route to serve the temporary file
router.get('/files/:fileName', fileController.serveFile);

export default router;
