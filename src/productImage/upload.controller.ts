import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Res,
  Param,
  Get,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UploadService } from './upload.service';
import * as path from 'path';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/role.decorator';

@ApiTags('File - Product Image')
@Controller('productImage')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('product-manager', 'sales-manager')
  @ApiOperation({
    summary: 'Upload a product image',
    description:
      'Allows users to upload a product image file. The file must be an image (jpg, jpeg, png, gif).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      example: {
        fileId: 'a1b2c3d4-5678-90ef-gh12-345678ijklmn',
        message: 'File uploaded successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file type or no file provided',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/product-images',
        filename: (req, file, callback) => {
          const fileExtName = path.extname(file.originalname);
          const fileName = `${randomUUID()}${fileExtName}`;
          callback(null, fileName);
        },
      }),
      fileFilter: (req, file, callback) => {
        const validExtensions = [
          '.png',
          '.jpg',
          '.jpeg',
          '.gif',
          '.webp',
          '.bmp',
          '.svg',
          '.tiff',
        ];
        const fileExtName = path.extname(file.originalname).toLowerCase();
        const isValid = validExtensions.includes(fileExtName);
        const isMimeTypeValid = file.mimetype.startsWith('image/');
        if (isValid && isMimeTypeValid) {
          callback(null, true);
        } else {
          callback(
            new HttpException(
              'Invalid file type. Only image files are allowed.',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
    }
    const fileMeta = await this.uploadService.saveFileMetadata(file);
    return {
      fileId: fileMeta.id,
      message: 'File uploaded successfully',
    };
  }

  @Get(':fileId')
  @ApiOperation({
    summary: 'Get a product image',
    description: 'Serves the product image file by its unique file ID.',
  })
  @ApiParam({
    name: 'fileId',
    description: 'The unique identifier of the uploaded file',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'The image file is returned.',
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  async serveProductImage(
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ) {
    const filePath = await this.uploadService.getFilePath(fileId);
    if (!filePath) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }
    return res.sendFile(filePath, { root: './' });
  }
}
