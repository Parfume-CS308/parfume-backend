import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File } from '../entities/file.entity'; // Import the Mongoose schema

@Injectable()
export class UploadService {
  constructor(
    @InjectModel(File.name) private readonly FileModel: Model<File>,
  ) {}

  /**
   * Save metadata of the uploaded file in the database.
   * @param file Uploaded file metadata from Multer.
   * @returns The saved file document.
   */
  async saveFileMetadata(file: Express.Multer.File): Promise<File> {
    const newFile = new this.FileModel({
      id: file.filename.split('.')[0], // Use the filename as a unique ID
      path: `uploads/product-images/${file.filename}`,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });
    return newFile.save();
  }

  /**
   * Retrieve the file path from the database using the file ID.
   * @param fileId The unique ID of the file.
   * @returns The file path if found.
   */
  async getFilePath(fileId: string): Promise<string> {
    const file = await this.FileModel.findOne({ id: fileId }).exec();
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return file.path;
  }
}
