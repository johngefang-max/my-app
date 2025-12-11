import { NextRequest, NextResponse } from 'next/server';
import { generateSignature, verifySignature } from '@/services/creem';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { test = false } = body;

    if (!test) {
      return NextResponse.json({
        success: false,
        error: 'Set test=true to run signature verification test'
      });
    }

    // 测试参数
    const testParams = {
      request_id: 'req_test_123456789',
      checkout_id: 'chk_test_987654321',
      order_id: 'order_test_abc123',
      customer_id: 'cus_test_xyz789',
      product_id: process.env.CREEM_PRODUCT_ID || 'prod_5JtwzQinzndziQS0Da8jkn'
    };

    console.log('Running Creem signature verification test...');

    // 生成签名
    const signature = generateSignature(testParams);
    console.log('Generated signature:', signature);

    // 验证签名
    const isValid = verifySignature(testParams, signature);
    console.log('Signature verification result:', isValid);

    // 测试错误签名
    const wrongSignature = 'invalid_signature_hash';
    const isWrongRejected = !verifySignature(testParams, wrongSignature);

    return NextResponse.json({
      success: true,
      testResults: {
        signatureGenerated: !!signature,
        validSignatureAccepted: isValid,
        invalidSignatureRejected: isWrongRejected,
        allTestsPassed: isValid && isWrongRejected
      },
      testParams,
      generatedSignature: signature
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}