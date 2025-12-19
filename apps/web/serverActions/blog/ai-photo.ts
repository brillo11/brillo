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

/**
 * AI Gateway를 통한 이미지 편집
 */
export async function editImageWithAI(
    imageUrl: string,
    mediaType: string,
    instruction: string
) {
    console.log(`📝 Editing with instruction: "${instruction}"`);

    try {
        const editResult = await generateText({
            model: 'google/gemini-2.5-flash-image',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: instruction,
                        },
                        {
                            type: 'image',
                            image: imageUrl,
                            mediaType: mediaType,
                        },
                    ],
                },
            ],
        });

        if (editResult.files && editResult.files.length > 0) {
            console.log(`✅ Edited image generated (${editResult.files.length} file(s))`);
            return editResult.files[0];
        } else {
            console.log('⚠️ No image files returned');
            return null;
        }
    } catch (error) {
        console.error('AI editing error:', error);
        return null;
    }
}
