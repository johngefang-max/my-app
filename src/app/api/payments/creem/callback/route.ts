import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json()

    const { paymentId, status, amount, currency, userId, planId } = callbackData

    // Initialize Supabase configuration
    const baseUrl = process.env.my_app_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_my_app_SUPABASE_URL
    const serviceKey = process.env.my_app_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const anonKey = process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.my_app_SUPABASE_ANON_KEY || ''
    const bearer = serviceKey || anonKey

    // Find the transaction using REST API
    const transactionRes = await fetch(`${baseUrl}/rest/v1/transactions?metadata->>payment_id=eq.${paymentId}&user_id=eq.${userId}`, {
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey
      }
    })

    const transactions = await transactionRes.json()
    const transaction = Array.isArray(transactions) && transactions.length > 0 ? transactions[0] : null

    if (!transaction) {
      console.error('Transaction not found:', paymentId)
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Update transaction status using REST API
    const updateRes = await fetch(`${baseUrl}/rest/v1/transactions?id=eq.${transaction.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        status: status === 'success' ? 'completed' : 'failed',
        updated_at: new Date().toISOString()
      })
    })

    if (!updateRes.ok) {
      console.error('Failed to update transaction status:', await updateRes.text())
      return NextResponse.json(
        { error: 'Failed to update transaction' },
        { status: 500 }
      )
    }

    if (status === 'success') {
      // Update user subscription using REST API
      const subscriptionData = {
        plan: planId === 'pro_yearly' ? 'pro_yearly' : 'pro_monthly',
        updated_at: new Date().toISOString()
      }

      const userUpdateRes = await fetch(`${baseUrl}/rest/v1/users?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearer}`,
          'apikey': anonKey,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(subscriptionData)
      })

      if (userUpdateRes.ok) {
        console.log(`User ${userId} successfully subscribed to ${planId}`)

        // Add bonus points for subscribing using PointsService
        try {
          // Note: PointsService still uses the Supabase client, but that should be fine
          // since it's a separate operation and we have the service role key
          const { PointsService } = await import('@/lib/points-service')
          const bonusPoints = planId === 'pro_yearly' ? 500 : 100
          await PointsService.addPoints(
            userId,
            bonusPoints,
            'bonus',
            `Subscription bonus: ${planId}`
          )
        } catch (pointsError) {
          console.error('Failed to add bonus points:', pointsError)
          // Don't fail the whole operation if points addition fails
        }
      } else {
        console.error('Failed to update user subscription:', await userUpdateRes.text())
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Callback processed successfully'
    })

  } catch (error) {
    console.error('Payment callback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle GET requests for payment status checking
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('payment_id')

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Missing payment_id' },
        { status: 400 }
      )
    }

    // Initialize Supabase configuration
    const baseUrl = process.env.my_app_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_my_app_SUPABASE_URL
    const serviceKey = process.env.my_app_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const anonKey = process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.my_app_SUPABASE_ANON_KEY || ''
    const bearer = serviceKey || anonKey

    // Get transaction details using REST API
    const transactionRes = await fetch(`${baseUrl}/rest/v1/transactions?metadata->>payment_id=eq.${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey
      }
    })

    const transactions = await transactionRes.json()
    const transaction = Array.isArray(transactions) && transactions.length > 0 ? transactions[0] : null

    return NextResponse.json({
      success: true,
      status: transaction?.status || 'unknown',
      transaction: transaction
    })

  } catch (error) {
    console.error('Payment status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}