import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';

export class UploadController {
  /**
   * Upload a single image file
   * POST /api/upload
   */
  async uploadImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      // Return the file path
      const imagePath = `/uploads/${req.file.filename}`;
      
      res.status(200).json({
        message: 'Image uploaded successfully',
        imagePath,
        path: imagePath,
        filename: req.file.filename,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Failed to upload image', error: error.message });
    }
  }
}

export const uploadController = new UploadController();
