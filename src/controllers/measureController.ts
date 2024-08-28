import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { imageToText } from '../utils/utils';

const prisma = new PrismaClient()

class MeasureController {
  async uploadMeasure(req: Request, res: Response): Promise<void> {
    try {
      const image = req.body?.image
      const customerCode = req.body?.customer_code
      const measureDatetime = req.body?.measure_datetime
      const measureType = req.body?.measure_type
      const measures = await prisma.measure.findMany()

      if (image) {
        const result = await imageToText(image, "first")
        res.json({
          text: result?.text || '',
          fileTempURL: `${req.protocol}://${req.get('host')}/api/files/${result?.fileTempPath}`
        });
        return;
      }

      res.json(measures);
    } catch (error) {
      res.status(500).send("Unknown error")
    }
  }

  async getMeasuresById(req: Request, res: Response): Promise<void> {
    try {
      res.json([]);
    } catch (error) {
      res.status(500).send("Unknown error")
    }
  }

  async confirmMeasureValue(req: Request, res: Response): Promise<void> {
    try {
      res.json([]);
    } catch (error) {
      res.status(500).send("Unknown error")
    }
  }
}

export const measureController = new MeasureController();
