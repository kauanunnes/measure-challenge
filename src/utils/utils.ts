import dotenv from "dotenv";
import fs from "fs";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import { Request } from "express";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const fileManager = new GoogleAIFileManager(GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

export const imageToText = async (base64: string, measureId: string) => {
  try {
    const outputFolderPath = path.join(__dirname, "..", "tmp");

    if (!fs.existsSync(outputFolderPath)) {
      fs.mkdirSync(outputFolderPath);
    }
    const outputFilePath = path.join(
      __dirname,
      "..",
      "tmp",
      `${measureId}.jpg`
    );

    const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    fs.writeFileSync(outputFilePath, buffer);
    const uploadResponse = await fileManager.uploadFile(outputFilePath, {
      mimeType: "image/jpeg",
      displayName: "Jetpack drawing",
    });

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      {
        text: "say me the numbers in image, just the numbers without any other text",
      },
    ]);
    const text = result.response.text();
    return { text, fileTempPath: `${measureId}.jpg` };
  } catch (error) {
    console.log(error)
  }
};

export const checkBody = (req: Request): boolean => {
  const image = req.body?.image;
  const customerCode = req.body?.customer_code;
  const measureDatetime = req.body?.measure_datetime;
  const measureType = req.body?.measure_type;
  if (!validateImage(image)) {
    return false;
  }

  if (!validateCustomerCode(customerCode)) {
    return false;
  }

  if (!validateMeasureDatetime(measureDatetime)) {
    return false;
  }

  if (!validateMeasureType(measureType)) {
    return false;
  }

  return true;
};

const validateImage = (image: string): boolean => {
  if (!image || image.length % 4 !== 0) {
    return false;
  }

  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  if (!base64Regex.test(image)) {
    return false;
  }

  const decoded = Buffer.from(image, "base64").toString("binary");
  const reEncoded = Buffer.from(decoded, "binary").toString("base64");

  return (
    image === reEncoded ||
    image === reEncoded + "=" ||
    image === reEncoded + "=="
  );
};

export const validateCustomerCode = (customerCode: unknown): boolean => {
  return typeof customerCode === "string";
};

const validateMeasureDatetime = (measureDatetime: string): boolean => {
  const date = new Date(measureDatetime);
  return !isNaN(date.getTime());
};

export const validateMeasureType = (measureType: string): boolean => {
  const typeUpperCase = measureType?.toUpperCase();
  return typeUpperCase === "WATER" || typeUpperCase === "GAS";
};