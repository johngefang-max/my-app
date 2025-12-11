import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { PointsService } from '@/lib/points-service'

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json()

    const { paymentId, status, amount, currency, userId, planId } = callbackData

    // Find the transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('metadata->>payment_id', paymentId)
      .eq('user_id', userId)
      .single()

    if (transactionError || !transaction) {
      console.error('Transaction not found:', paymentId)
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Update transaction status
    await supabase
      .from('transactions')
      .update({
        status: status === 'success' ? 'completed' : 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', transaction.id)

    if (status === 'success') {
      // Update user subscription
      const subscriptionData = {
        plan: planId === 'pro_yearly' ? 'pro_yearly' : 'pro_monthly',
        subscription_status: 'active',
        subscribed_at: new Date().toISOString(),
        subscription_expires_at: planId === 'pro_yearly'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }

      await supabase
        .from('users')
        .update(subscriptionData)
        .eq('id', userId)

      // Add bonus points for subscribing
      const bonusPoints = planId === 'pro_yearly' ? 500 : 100
      await PointsService.addPoints(
        userId,
        bonusPoints,
        'bonus',
        `Subscription bonus: ${planId}`
      )

      console.log(`User ${userId} successfully subscribed to ${planId}`)
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

    // Get transaction details
    const { data: transaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('metadata->>payment_id', paymentId)
      .single()

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