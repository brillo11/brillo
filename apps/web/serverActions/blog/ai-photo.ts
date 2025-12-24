import { generateText } from 'ai';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

/**
 * S3에 이미지 업로드
 */
export async function uploadToS3(
    buffer: Buffer,
    folder: string,
    filename: string,
    contentType: string
): Promise<string> {
    const key = `${folder}/${filename}`;

    await s3Client.send(
        new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        })
    );

    return `${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${key}`;
}

