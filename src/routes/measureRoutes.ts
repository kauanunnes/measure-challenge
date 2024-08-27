import { Router } from 'express';
import { measureController } from '../controllers/measureController';

const router = Router();

router.post('/upload', measureController.uploadMeasure);
router.patch('/confirm', measureController.confirmMeasureValue);
router.get('/:id/list', measureController.getMeasuresById);

export default router;
