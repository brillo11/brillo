"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function uploadFileToS3(file: any, folder: string) {
  const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
  });

  // FormData에서 전달된 File 객체 처리
  let fileBuffer;
  let fileName;
  let contentType;

  // 입력 파라미터 체크
  console.log(
    "File type:",
    file ? typeof file : "null",
    "Is File:",
    file instanceof File,
    "Has name:",
    file && "name" in file
  );

  try {
    if (file instanceof File) {
      // 브라우저 환경의 File 객체인 경우
      fileBuffer = await file.arrayBuffer();
      fileName = `${folder}/${Date.now()}_${file.name.replace(/\s/g, "_")}`;
      contentType = file.type;
    } else if (file && typeof file === "object" && "name" in file) {
      // NextJS 서버 액션에서 전달된 객체인 경우
      if ("text" in file && typeof file.text === "function") {
        fileBuffer = Buffer.from(await file.text());
      } else if (
        "arrayBuffer" in file &&
        typeof file.arrayBuffer === "function"
      ) {
        fileBuffer = await file.arrayBuffer();
      } else if ("stream" in file && typeof file.stream === "function") {
        const reader = file.stream().getReader();
        const chunks = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }

        fileBuffer = Buffer.concat(chunks);
      } else {
        throw new Error("File object does not have readable content");
      }

      fileName = `${folder}/${Date.now()}_${file.name.replace(/\s/g, "_")}`;
      contentType = file.type || "application/octet-stream";
    } else {
      console.error("Invalid file object:", file);
      throw new Error("Invalid file object format");
    }

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: fileName,
      Body: Buffer.from(fileBuffer),
      ContentType: contentType
    });

    await s3Client.send(command);

    // CloudFront URL 반환
    return `${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${fileName}`;
  } catch (error) {
    console.error("Error in uploadFileToS3:", error);
    throw error;
  }
}
