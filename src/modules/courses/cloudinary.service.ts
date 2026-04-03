import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';

@Injectable()
export class CloudinaryService {
  async uploadVideo(filePath: string): Promise<{ url: string; public_id: string; duration: number; format: string }> {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder: 'devnest/videos',
      chunk_size: 6000000,
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      duration: Math.round(result.duration || 0),
      format: result.format,
    };
  }

  async uploadImage(filePath: string): Promise<{ url: string; public_id: string }> {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'image',
      folder: 'devnest/thumbnails',
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }

  async deleteResource(publicId: string, type: 'video' | 'image' = 'image') {
    await cloudinary.uploader.destroy(publicId, { resource_type: type });
  }

  getSignedUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      resource_type: 'video',
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 60,
    });
  }
}