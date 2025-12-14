import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function POST(request: NextRequest) {
  try {
    // Get token for authentication
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
    })

    if (!token?.email) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { planId } = body

    if (!planId) {
      return NextResponse.json(
        { error: 'Missing planId parameter' },
        { status: 400 }
      )
    }

    // Simulate a successful payment response
    // This is for testing purposes only
    console.log('Test payment endpoint called:', { planId, email: token.email })

    return NextResponse.json({
      success: true,
      paymentUrl: 'https://checkout.stripe.com/pay/test_payment_url', // Mock URL
      checkoutId: 'test_checkout_' + Date.now(),
      test: true,
      message: 'This is a test payment endpoint'
    })

  } catch (error) {
    console.error('Test payment error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}