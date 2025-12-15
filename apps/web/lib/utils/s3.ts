import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function putMp4ToS3(params: { key: string; body: Uint8Array }) {
  const Bucket = process.env.S3_BUCKET!;
  await s3.send(
    new PutObjectCommand({
      Bucket,
      Key: params.key,
      Body: params.body,
      ContentType: "video/mp4",
      // 필요시: CacheControl: "public, max-age=31536000, immutable",
    })
  );

  const base = process.env.CLOUDFRONT_BASE_URL!;
  return `${base.replace(/\/$/, "")}/${params.key}`;
}
