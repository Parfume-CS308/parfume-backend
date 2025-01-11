import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { File, FileSchema } from 'src/entities/file.entity';

@Module({
  providers: [UploadService],
  imports: [
    MongooseModule.forFeature([
      {
        name: File.name,
        schema: FileSchema,
      },
    ]),
    AuthModule,
  ],
  controllers: [UploadController],
})
export class UploadModule {}
