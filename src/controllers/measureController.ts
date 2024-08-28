import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  checkBody,
  imageToText,
  validateMeasureType,
  validateCustomerCode,
} from "../utils/utils";
import { endOfMonth, startOfMonth } from "date-fns";

const prisma = new PrismaClient();

class MeasureController {
  constructor() {
    this.uploadMeasure = this.uploadMeasure.bind(this);
    this.getMeasuresById = this.getMeasuresById.bind(this);
    this.confirmMeasureValue = this.confirmMeasureValue.bind(this);
  }

  private handleError(res: Response, error: unknown) {
    console.error(error);
    res.status(500).send("Unknown error");
  }

  private sendError(
    res: Response,
    status: number,
    errorCode: string,
    errorDescription: string
  ) {
    res
      .status(status)
      .json({ error_code: errorCode, error_description: errorDescription });
  }

  async uploadMeasure(req: Request, res: Response): Promise<void> {
    if (!checkBody(req)) {
      return this.sendError(
        res,
        400,
        "INVALID_DATA",
        "Os dados fornecidos no corpo da requisição são inválidos"
      );
    }

    const {
      image,
      customer_code: customerCode,
      measure_datetime: measureDatetime,
      measure_type: measureType,
    } = req.body;

    try {
      const measureExists = await this.checkIfMeasureExists(
        customerCode,
        measureType,
        measureDatetime
      );
      if (measureExists) {
        return this.sendError(
          res,
          409,
          "DOUBLE_REPORT",
          "Já existe uma leitura para este tipo no mês atual"
        );
      }

      let newMeasure = await prisma.measure.create({
        data: {
          customerId: customerCode,
          datetime: measureDatetime,
          measure_value: 0,
          type: measureType.toUpperCase(),
        },
      });

      const result = await imageToText(image, newMeasure.id);

      newMeasure = await prisma.measure.update({
        where: {
          id: newMeasure.id,
        },
        data: {
          measure_value: parseInt(result?.text || "0"),
        },
      });

      res.json({
        image_url: `${req.protocol}://${req.get("host")}/files/${
          result?.fileTempPath
        }`,
        measure_value: newMeasure.measure_value,
        measure_uuid: newMeasure.id,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getMeasuresById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const query = req.query?.measure_type?.toString().toUpperCase();

    if (query && !validateMeasureType(query)) {
      return this.sendError(
        res,
        400,
        "INVALID_TYPE",
        "Tipo de medição não permitida"
      );
    }

    try {
      const measures = await prisma.measure.findMany({
        where: {
          customerId: id,
          ...(query && { type: query }),
        },
      });

      if (measures.length === 0) {
        return this.sendError(
          res,
          404,
          "MEASURES_NOT_FOUND",
          "Nenhuma leitura encontrada"
        );
      }

      res.json(measures);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async confirmMeasureValue(req: Request, res: Response): Promise<void> {
    const { confirmed_value: confirmValue, measure_uuid: measureId } = req.body;

    if (!validateCustomerCode(measureId) || isNaN(parseInt(confirmValue))) {
      return this.sendError(
        res,
        400,
        "INVALID_DATA",
        "Os dados fornecidos no corpo da requisição são inválidos"
      );
    }

    try {
      const measure = await prisma.measure.findFirst({
        where: { id: measureId },
      });

      if (!measure) {
        return this.sendError(
          res,
          404,
          "MEASURES_NOT_FOUND",
          "Nenhuma leitura encontrada"
        );
      }

      if (measure.confirmed_value !== null) {
        return this.sendError(
          res,
          409,
          "CONFIRMATION_DUPLICATE",
          "Leitura já confirmada"
        );
      }

      await prisma.measure.update({
        where: { id: measureId },
        data: { confirmed_value: confirmValue },
      });

      res.status(200).json({ success: "true" });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private async checkIfMeasureExists(
    customerCode: string,
    measureType: string,
    measureDatetime: string
  ) {
    const date = new Date(measureDatetime);
    const startOfMonthDate = startOfMonth(date);
    const endOfMonthDate = endOfMonth(date);

    return await prisma.measure.findFirst({
      where: {
        customerId: customerCode,
        type: measureType.toUpperCase(),
        datetime: {
          gte: startOfMonthDate.toISOString(),
          lte: endOfMonthDate.toISOString(),
        },
      },
    });
  }
}

export const measureController = new MeasureController();
