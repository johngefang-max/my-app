import { NextRequest, NextResponse } from 'next/server';
import { createCheckout } from '@/services/creem';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, requestId } = body;

    console.log('Received checkout request:', { planId, requestId });

    // 创建 Creem 支付会话
    const response = await createCheckout({
      requestId: requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      successUrl: `${process.env.NEXTAUTH_URL}/payment/success`
    });

    console.log('Checkout created successfully:', response.checkout_url);

    return NextResponse.json({
      success: true,
      checkout_url: response.checkout_url,
      checkout_id: response.checkout_id
    });

  } catch (error) {
    console.error('Error creating checkout:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create payment session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}