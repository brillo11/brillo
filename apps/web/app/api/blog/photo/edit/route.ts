import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { uploadToS3, editImageWithAI } from '@/serverActions/blog/ai-photo';

/**
 * 이미지 편집 API
 * S3에 업로드된 이미지 URL을 받아 AI로 편집 후 결과를 S3에 저장합니다.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { imageUrl, contentType, instruction } = body;

        if (!imageUrl) {
            return NextResponse.json(
                { success: false, error: 'imageUrl이 필요합니다.' },
                { status: 400 }
            );
        }

        console.log('🎨 Starting AI editing for:', imageUrl);

        // AI Gateway로 이미지 편집
        const defaultInstruction =
            instruction ||
            'Enhance the photo naturally: smooth skin tone, reduce minor blemishes, improve lighting, but keep the person recognizable and natural-looking. Suitable for professional medical blog.';

        const editedFile = await editImageWithAI(
            imageUrl,
            contentType || 'image/jpeg',
            defaultInstruction
        );

        if (!editedFile || !('base64Data' in editedFile) || !editedFile.base64Data) {
            return NextResponse.json(
                { success: false, error: '이미지 편집에 실패했습니다.' },
                { status: 500 }
            );
        }

        console.log('✅ AI editing completed');
        console.log('📤 Uploading edited image to S3...');

        // 편집된 이미지를 S3 /blog/output/photos 폴더에 업로드
        const editedBuffer = Buffer.from(editedFile.base64Data as string, 'base64');
        const timestamp = Date.now();
        const uuid = uuidv4();
        const editedFilename = `edited_${timestamp}_${uuid}.jpg`;
        const outputUrl = await uploadToS3(
            editedBuffer,
            'blog/output/photos',
            editedFilename,
            editedFile.mediaType || contentType || 'image/jpeg'
        );

        console.log('✅ Edited image uploaded:', outputUrl);

        return NextResponse.json({
            success: true,
            originalUrl: imageUrl,
            editedUrl: outputUrl,
            instruction: defaultInstruction,
        });
    } catch (error) {
        console.error('❌ Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
