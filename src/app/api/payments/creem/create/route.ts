import { NextRequest, NextResponse } from 'next/server'
import { createCheckout } from '@/services/creem'
import { getToken } from 'next-auth/jwt'

export async function POST(request: NextRequest) {
  try {
    // 1. 验证请求体
    let body;
    try {
      const text = await request.text();
      console.log('Request raw body:', text);

      if (!text.trim()) {
        console.error('Empty request body');
        return NextResponse.json(
          { error: 'Request body is empty' },
          { status: 400 }
        );
      }

      body = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { planId } = body;

    console.log('Payment creation request:', { planId, receivedBody: body });

    if (!planId) {
      console.error('Missing required parameter: planId');
      return NextResponse.json(
        { error: 'Missing planId parameter', details: { received: body } },
        { status: 400 }
      );
    }

    // Get user from JWT token instead of trusting frontend
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
    })

    if (!token?.email) {
      console.error('No authenticated user found')
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    console.log('Looking up user with email:', token.email)

    // Use Supabase REST API to find user (same as auth flow)
    const baseUrl = process.env.my_app_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_my_app_SUPABASE_URL
    const serviceKey = process.env.my_app_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const anonKey = process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.my_app_SUPABASE_ANON_KEY || ''

    if (!baseUrl || !anonKey) {
      console.error('Missing Supabase configuration')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const bearer = serviceKey || anonKey

    // Find user by email using REST API
    const userRes = await fetch(`${baseUrl}/rest/v1/users?email=eq.${encodeURIComponent(token.email)}&select=*`, {
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey
      }
    })

    const users = await userRes.json()
    const user = Array.isArray(users) && users.length > 0 ? users[0] : null

    if (!user) {
      console.error('User not found in database for email:', token.email)
      return NextResponse.json(
        {
          error: 'User not found in database',
          details: 'Please log out and log back in with your Google account to create your account',
          email: token.email,
          requiresReauth: true
        },
        { status: 404 }
      )
    }

    console.log('User found successfully:', {
      id: user.id,
      email: user.email,
      username: user.username,
      plan: user.plan
    })

    // Define pricing plans
    const plans = {
      pro_monthly: {
        amount: 1990, // $19.90 in cents
        currency: 'USD',
        description: 'Pro Plan - Monthly'
      },
      pro_yearly: {
        amount: 21492, // $214.92 in cents (19.9 * 12 * 0.9)
        currency: 'USD',
        description: 'Pro Plan - Yearly'
      }
    }

    const plan = plans[planId as keyof typeof plans]
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    // Create payment with Creem
    console.log('Attempting to create Creem payment...')

    let paymentResult;
    try {
      paymentResult = await createCheckout({
        requestId: `req_${Date.now()}_${user.id}`,
        successUrl: `${process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL || request.nextUrl.origin}/payment/success`
      });

      console.log('Payment checkout created:', {
        checkout_id: paymentResult.checkout_id,
        checkout_url: paymentResult.checkout_url ? 'present' : 'missing'
      });
    } catch (creemError) {
      console.error('Creem payment creation failed:', creemError);

      // 检查是否是配置错误
      if (creemError instanceof Error && creemError.message.includes('CREEM_API_KEY')) {
        return NextResponse.json(
          {
            error: 'Payment service configuration error',
            details: 'Payment provider not properly configured. Please contact support.'
          },
          { status: 500 }
        );
      }

      // Check for authentication/authorization errors
      if (creemError instanceof Error && creemError.message.includes('403')) {
        return NextResponse.json(
          {
            error: 'Payment service unavailable',
            details: 'We are experiencing technical difficulties with our payment provider. Please try again later or contact support.'
          },
          { status: 503 }
        );
      }

      if (creemError instanceof Error && creemError.message.includes('401')) {
        return NextResponse.json(
          {
            error: 'Payment service configuration error',
            details: 'Payment provider authentication failed. Please contact support.'
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          error: 'Failed to create payment session',
          details: creemError instanceof Error ? creemError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // 验证支付结果
    if (!paymentResult || !paymentResult.checkout_url) {
      console.error('Invalid payment result from Creem:', paymentResult);
      return NextResponse.json(
        {
          error: 'Invalid response from payment provider',
          details: 'No checkout URL received'
        },
        { status: 500 }
      );
    }
    // Store payment attempt in database using REST API
    console.log('Storing transaction in database...');
    try {
      const transactionData = {
        user_id: user.id,
        type: 'subscription',
        amount: plan.amount, // Should be 999 or 9999 (in cents)
        currency: plan.currency,
        status: 'pending',
        metadata: {
          checkout_id: paymentResult.checkout_id,
          plan_id: planId,
          payment_provider: 'creem'
        }
        // created_at will be set automatically by database default
      }

      console.log('Creating transaction with data:', {
        ...transactionData,
        metadata: JSON.stringify(transactionData.metadata)
      });

      const transactionRes = await fetch(`${baseUrl}/rest/v1/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearer}`,
          'apikey': anonKey,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(transactionData)
      })

      if (!transactionRes.ok) {
        const errorText = await transactionRes.text();
        console.error('Failed to store transaction:', {
          status: transactionRes.status,
          statusText: transactionRes.statusText,
          error: errorText
        });

        // 记录错误但不中断支付流程
        console.warn('Payment created successfully, but transaction storage failed');
      } else {
        const createdTransaction = await transactionRes.json();
        console.log('Transaction stored successfully:', {
          id: createdTransaction[0]?.id,
          checkout_id: createdTransaction[0]?.metadata?.checkout_id
        });
      }
    } catch (transactionError) {
      console.error('Transaction storage error:', transactionError);
      // 继续执行 - 支付已创建，只是事务存储失败
    }

    return NextResponse.json({
      success: true,
      paymentUrl: paymentResult.checkout_url,
      checkoutId: paymentResult.checkout_id
    })

  } catch (error) {
    console.error('Create payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}