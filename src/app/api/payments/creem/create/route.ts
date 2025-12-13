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

    if (userError && userError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Database error when finding user:', userError)
      console.error('Error details:', {
        message: userError.message,
        details: userError.details,
        hint: userError.hint,
        code: userError.code
      })

      return NextResponse.json(
        {
          error: 'Database error',
          details: userError.message,
          email: token.email
        },
        { status: 500 }
      )
    }

    // If user doesn't exist, create one using token information
    if (!user) {
      console.log('User not found, attempting to create user:', token.email)

      const newUser = {
        email: token.email,
        username: token.name || token.email?.split('@')[0] || 'user_' + Date.now(),
        avatar_url: token.picture || null,
        plan: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json(
          {
            error: 'Failed to create user account',
            details: createError.message,
            email: token.email,
            requiresReauth: true
          },
          { status: 500 }
        )
      }

      user = createdUser
      console.log('User created successfully:', { id: user.id, email: user.email })
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