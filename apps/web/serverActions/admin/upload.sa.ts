'use server';

import { auth } from '@/auth';
import { nanoid } from 'nanoid';
import { uploadFileToS3 } from './community/uploadToS3';

/**
 * 이미지 파일을 업로드하는 서버 액션
 */
export async function uploadImage(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('인증되지 않은 사용자입니다.');
  }

  try {
    // 환경 변수 확인
    const requiredEnvVars = [
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'AWS_REGION',
      'S3_BUCKET_NAME',
      'NEXT_PUBLIC_CLOUDFRONT_URL'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingEnvVars.length > 0) {
      console.error(`Missing environment variables: ${missingEnvVars.join(', ')}`);
      throw new Error('서버 설정이 완료되지 않았습니다. 관리자에게 문의하세요.');
    }

    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('파일이 없습니다.');
    }

    // 이미지 파일만 허용
    if (!file.type.startsWith('image/')) {
      throw new Error('이미지 파일만 업로드 가능합니다.');
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('파일 크기는 5MB를 초과할 수 없습니다.');
    }

    // S3에 파일 업로드
    const folder = '/images/course/';
    const url = await uploadFileToS3(file, folder);

    return {
      url,
      path: url.split('/').pop() || '',
    };
  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    
    // 자세한 오류 메시지 전달
    if (error instanceof Error) {
      throw new Error(`이미지 업로드에 실패했습니다: ${error.message}`);
    }
    
    throw new Error('이미지 업로드에 실패했습니다.');
  }
} 