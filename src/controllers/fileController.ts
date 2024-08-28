import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

class FileController {
  async serveFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileName } = req.params;
      const filePath = path.join(__dirname, '../tmp', fileName);

      if (fs.existsSync(filePath)) {
        res.sendFile(filePath, (err) => {
          if (err) {
            res.status(500).send('Failed to serve the file');
          } else {
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error('Error deleting the temporary file:', err);
              }
            });
          }
        });
      } else {
        res.status(404).send('File not found');
      }
    } catch (err) {
      console.error('Error in serveFile:', err);
      res.status(500).send('Internal Server Error');
    }
  }
}

export const fileController = new FileController();
