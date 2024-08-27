import { Request, Response } from 'express';

class MeasureController {
  async uploadMeasure(req: Request, res: Response): Promise<void> {
    try {
      res.json([]);
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
