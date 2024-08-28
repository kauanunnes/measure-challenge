import dotenv from "dotenv";
import fs from "fs";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const fileManager = new GoogleAIFileManager(GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

export const imageToText = async (base64: any, measureId: string) => {
  try {
    const outputFilePath = path.join(__dirname, "..", "tmp", `${measureId}.jpg`);

    const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");

    // Decode the Base64 string to binary data
    const buffer = Buffer.from(base64Data, "base64");

    // Write the buffer to a file
    fs.writeFileSync(outputFilePath, buffer);
    console.log("Image saved successfully:", outputFilePath);
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
      { text: "transcribe the numbers in image" },
    ]);
    const text = result.response.text();
    return {text, fileTempPath: `${measureId}.jpg`};
  } catch (error) {}
};
