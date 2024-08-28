import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  checkBody,
  imageToText,
  validateMeasureType,
} from "../utils/utils";

const prisma = new PrismaClient();

class MeasureController {
  async uploadMeasure(req: Request, res: Response): Promise<void> {
    try {
      if (!checkBody(req)) {
        res.status(400).json({
          error_code: "INVALID_DATA",
          error_description:
            "Os dados fornecidos no corpo da requisição são inválidos",
        });
        return;
      }

      const image = req.body?.image;
      const customerCode = req.body?.customer_code;
      const measureDatetime = req.body?.measure_datetime;
      const measureType = req.body?.measure_type;

      const measure = await prisma.measure.findFirst({
        where: {
          customerId: customerCode,
          type: measureType.toUpperCase(),
          datetime: measureDatetime,
        },
      });

      if (measure) {
        res.status(409).json({
          error_code: "DOUBLE_REPORT",
          error_description:
            "Já existe uma leitura para este tipo no mês atual",
        });
        return;
      }

      const result = await imageToText(image, "first");

      const newMeasure = await prisma.measure.create({
        data: {
          customerId: customerCode,
          datetime: measureDatetime,
          measure_value: parseInt(result?.text || "0"),
          type: measureType.toUpperCase(),
        },
      });

      res.json({
        image_url: `${req.protocol}://${req.get("host")}/api/files/${
          result?.fileTempPath
        }`,
        measure_value: newMeasure.measure_value,
        measure_uuid: newMeasure.id,
      });

      return;
    } catch (error) {
      res.status(500).send("Unknown error");
    }
  }

  async getMeasuresById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const query = req.query?.measure_type;
      if (query) {
        if (!validateMeasureType(query)) {
          res.status(400).json({
            error_code: "INVALID_TYPE",
            error_description: "Tipo de medição não permitida",
          });
          return;
        }
      }

      const measures = await prisma.measure.findMany({
        where: {
          customerId: id,
          ...(query && { type: query.toString().toUpperCase() as string }),
        },
      });

      if (measures.length == 0) {
        res.status(404).send({
          error_code: "MEASURES_NOT_FOUND",
          error_description: "Nenhuma leitura encontrada",
        });
        return;
      }

      res.json(measures);
      return;
    } catch (error) {
      res.status(500).send("Unknown error");
    }
  }

  async confirmMeasureValue(req: Request, res: Response): Promise<void> {
    try {
      res.json([]);
    } catch (error) {
      res.status(500).send("Unknown error");
    }
  }
}

export const measureController = new MeasureController();
