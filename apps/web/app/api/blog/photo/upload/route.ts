import { auth } from "@/shared/lib/auth";
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { success: false, error: '파일이 필요합니다.' },
                { status: 400 }
            );
        }

        // 파일 크기 제한 (10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: '파일 크기는 10MB를 초과할 수 없습니다.' },
                { status: 400 }
            );
        }

        // S3 키 생성: blog/input/{userId}/[timestamp]_[filename]_[uuid]
        const timestamp = Date.now();
        const uuid = uuidv4();
        const sanitizedFileName = file.name.replace(/\s/g, '_');
        const key = `blog/input/${userId}/${timestamp}_${sanitizedFileName}_${uuid}`;

        // 파일을 Buffer로 변환
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // S3에 업로드
        await s3Client.send(
            new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME!,
                Key: key,
                Body: buffer,
                ContentType: file.type,
            })
        );

        // CloudFront URL 생성
        const cloudFrontUrl = `${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${key}`;

        console.log('✅ File uploaded to S3:', key);

        return NextResponse.json({
            success: true,
            cloudFrontUrl,
            key,
        });
    } catch (error) {
        console.error('❌ File upload 오류:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

