'use server';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getCurrentUser } from '@/lib/auth';
import crypto from 'crypto';

/**
 * Configure S3 Client for Cloudflare R2
 */
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export interface PresignedUrlResult {
  success?: boolean;
  error?: string;
  presignedUrl?: string;
  publicUrl?: string;
}

export async function getPresignedUrl(
  fileName: string,
  fileType: string,
  folder: 'resumes' | 'avatars' | 'logos' | 'cover-letters'
): Promise<PresignedUrlResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Generate a unique file name to prevent overriding
    const fileExtension = fileName.split('.').pop();
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const safeFileName = `${user.id}-${uniqueId}.${fileExtension}`;
    const objectKey = `${folder}/${safeFileName}`;

    // Ensure Public URL is defined in env
    const r2PublicUrl = process.env.R2_PUBLIC_URL;
    if (!r2PublicUrl) {
      console.error('R2_PUBLIC_URL variable is missing in environment setup.');
      return { error: 'Server configuration error.' };
    }

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'job-portal', // Specify bucket name if needed from env
      Key: objectKey,
      ContentType: fileType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    // Construct the public URL assuming R2_PUBLIC_URL has no trailing slash
    const publicUrl = `${r2PublicUrl.replace(/\/$/, '')}/${objectKey}`;

    return {
      success: true,
      presignedUrl,
      publicUrl,
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return { error: 'Failed to generate upload URL' };
  }
}
