import { NextRequest, NextResponse } from 'next/server'
import { createCheckout } from '@/services/creem'
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

    // Use Supabase REST API to find user (same as auth flow)
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.my_app_SUPABASE_URL || process.env.NEXT_PUBLIC_my_app_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.my_app_SUPABASE_SERVICE_ROLE_KEY || ''
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY || process.env.my_app_SUPABASE_ANON_KEY || ''

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

    // Store payment attempt in database using REST API
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

      console.log('Creating transaction with data:', transactionData)

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
        const errorText = await transactionRes.text()
        console.error('Failed to store transaction:', errorText)
        console.error('Response status:', transactionRes.status, transactionRes.statusText)
        console.log('Payment created successfully, but transaction storage failed')
        // Continue anyway - payment creation succeeded, just transaction storage failed
      } else {
        const createdTransaction = await transactionRes.json()
        console.log('Transaction stored successfully:', createdTransaction)
      }
    } catch (transactionError) {
      console.error('Transaction storage error:', transactionError)
      // Continue anyway - payment creation succeeded, just transaction storage failed
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