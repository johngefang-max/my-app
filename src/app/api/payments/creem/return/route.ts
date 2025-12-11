import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('payment_id')
    const status = searchParams.get('status')
    const userId = searchParams.get('user_id')

    // Validate required parameters
    if (!paymentId || !status || !userId) {
      return NextResponse.redirect(
        new URL('/pricing?error=missing_params', request.url)
      )
    }

    // Update transaction if needed
    if (status === 'success') {
      // Find and update the transaction
      const { data: transaction } = await supabase
        .from('transactions')
        .select('*')
        .eq('metadata->>payment_id', paymentId)
        .eq('user_id', userId)
        .single()

      if (transaction && transaction.status === 'pending') {
        await supabase
          .from('transactions')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.id)

        // Get user's current subscription status
        const { data: user } = await supabase
          .from('users')
          .select('subscription_status, plan')
          .eq('id', userId)
          .single()

        // If subscription is already active, show success page
        if (user?.subscription_status === 'active') {
          return NextResponse.redirect(
            new URL('/payment/success?plan=' + user?.plan, request.url)
          )
        }
      }
    }

    // Redirect based on status
    if (status === 'success') {
      return NextResponse.redirect(
        new URL('/payment/success?payment_id=' + paymentId, request.url)
      )
    } else {
      return NextResponse.redirect(
        new URL('/payment/failed?payment_id=' + paymentId, request.url)
      )
    }

  } catch (error) {
    console.error('Payment return error:', error)
    return NextResponse.redirect(
      new URL('/pricing?error=processing_failed', request.url)
    )
  }
}