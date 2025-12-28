import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// @ts-ignore
import ffmpeg from "fluent-ffmpeg";
// @ts-ignore
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import fs from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import { requireStudent } from "@/shared/lib/auth-guards";

export const runtime = "nodejs";

// Configure FFmpeg path
if (ffmpegInstaller.path) {
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);
  console.log(`✅ FFmpeg path configured (API): ${ffmpegInstaller.path}`);
} else {
  console.error("❌ FFmpeg binary not found (API)");
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Uploads a file buffer to S3 and returns the public URL
 */
async function uploadToS3(buffer: Buffer, key: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: "video/mp4",
  });

  await s3Client.send(command);

  const cloudFrontUrl = process.env.NEXT_PUBLIC_CLOUDFRONT_URL!;
  return `${cloudFrontUrl}/${key}`;
}

/**
 * Downloads a file from a URL to a local temporary path
 */
async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to download file: ${response.statusText}`);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(buffer));
}

export async function POST(req: NextRequest) {
  try {
    // Auth check
    await requireStudent();

    const body = await req.json();
    const { videoUrl } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: "Missing videoUrl" },
        { status: 400 }
      );
    }

    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `input-${uuidv4()}.mp4`);
    const outputPath = path.join(tempDir, `output-${uuidv4()}.mp4`);

    console.log("🎬 Downloading video for processing (API)...");
    await downloadFile(videoUrl, inputPath);

    console.log("Processing video with FFmpeg (API)...");

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          "-vf",
          "crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920",
          "-c:a",
          "copy",
        ])
        .save(outputPath)
        .on("end", () => {
          console.log("FFmpeg processing finished");
          resolve();
        })
        .on("error", (err: Error) => {
          console.error("FFmpeg error:", err);
          reject(err);
        });
    });

    console.log("☁️ Uploading processed video to S3 (API)...");
    const videoBuffer = fs.readFileSync(outputPath);
    const s3Key = `ai-assistant/videos/shorts-${Date.now()}-${uuidv4()}.mp4`;
    const s3Url = await uploadToS3(videoBuffer, s3Key);

    // Cleanup temp files
    try {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    } catch (e) {
      console.warn("Failed to cleanup temp files:", e);
    }

    return NextResponse.json({ success: true, videoUrl: s3Url });
  } catch (error) {
    console.error("Video conversion failed (API):", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Video conversion failed",
      },
      { status: 500 }
    );
  }
}
