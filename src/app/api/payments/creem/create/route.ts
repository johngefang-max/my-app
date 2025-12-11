import { NextRequest, NextResponse } from 'next/server'
import { createCheckout } from '@/services/creem'
import { supabase } from '@/lib/supabase'
import { getToken } from 'next-auth/jwt'

export async function POST(request: NextRequest) {
  try {
    const { planId } = await request.json()

    console.log('Payment creation request:', { planId })

    if (!planId) {
      console.error('Missing required parameter: planId')
      return NextResponse.json(
        { error: 'Missing planId' },
        { status: 400 }
      )
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

    // Get user by email (more reliable than ID)
    let user: any = null
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', token.email)
      .single()

    user = userData

    if (userError) {
      console.error('Database error when finding user:', userError)
      console.error('Error details:', {
        message: userError.message,
        details: userError.details,
        hint: userError.hint,
        code: userError.code
      })

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

    if (!user) {
      console.error('User not found after database query')

      return NextResponse.json(
        {
          error: 'User not found',
          email: token.email,
          details: 'Please log out and log back in with your Google account to create your account',
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
        amount: 999, // $9.99 in cents
        currency: 'USD',
        description: 'Pro Plan - Monthly'
      },
      pro_yearly: {
        amount: 9999, // $99.99 in cents
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
    const paymentResult = await createCheckout({
      requestId: `req_${Date.now()}_${user.id}`,
      successUrl: `${process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL}/payment/success`
    })

    // Store payment attempt in database
    await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'subscription',
      amount: plan.amount,
      currency: plan.currency,
      status: 'pending',
      metadata: {
        checkout_id: paymentResult.checkout_id,
        plan_id: planId,
        payment_provider: 'creem'
      }
    })

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