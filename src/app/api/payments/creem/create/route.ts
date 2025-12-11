import { NextRequest, NextResponse } from 'next/server'
import { createCheckout } from '@/services/creem'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { planId, userId } = await request.json()

    if (!planId || !userId) {
      return NextResponse.json(
        { error: 'Missing planId or userId' },
        { status: 400 }
      )
    }

    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

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
      requestId: `req_${Date.now()}_${userId}`,
      successUrl: `${process.env.NEXTAUTH_URL}/payment/success`
    })

    // Store payment attempt in database
    await supabase.from('transactions').insert({
      user_id: userId,
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