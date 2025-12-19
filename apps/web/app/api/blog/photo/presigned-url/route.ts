import { auth } from "@/shared/lib/auth";
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: req.headers
        });

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const body = await req.json();
        const { fileName, contentType } = body;

        if (!fileName || !contentType) {
            return NextResponse.json(
                { success: false, error: 'fileName과 contentType이 필요합니다.' },
                { status: 400 }
            );
        }

        // S3 키 생성: blog/input/{userId}/[timestamp]_[filename]_[uuid]
        const timestamp = Date.now();
        const uuid = uuidv4();
        const sanitizedFileName = fileName.replace(/\s/g, '_');
        const key = `blog/input/${userId}/${timestamp}_${sanitizedFileName}_${uuid}`;

        // Presigned URL 생성 (15분 유효)
        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: key,
            ContentType: contentType,
        });

        // @ts-expect-error - AWS SDK 버전 간 @smithy/types 호환성 문제
        const presignedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 900, // 15분
        });

        // CloudFront URL 생성
        const cloudFrontUrl = `${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${key}`;

        console.log('✅ Presigned URL generated:', key);

        return NextResponse.json({
            success: true,
            presignedUrl,
            cloudFrontUrl,
            key,
        });
    } catch (error) {
        console.error('❌ Presigned URL 생성 오류:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
