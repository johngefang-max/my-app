import { NextRequest, NextResponse } from 'next/server'

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

    // Initialize Supabase configuration
    const baseUrl = process.env.my_app_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_my_app_SUPABASE_URL
    const serviceKey = process.env.my_app_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const anonKey = process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.my_app_SUPABASE_ANON_KEY || ''
    const bearer = serviceKey || anonKey

    // Update transaction if needed
    if (status === 'success') {
      // Find the transaction using REST API
      const transactionRes = await fetch(`${baseUrl}/rest/v1/transactions?metadata->>payment_id=eq.${paymentId}&user_id=eq.${userId}`, {
        headers: {
          'Authorization': `Bearer ${bearer}`,
          'apikey': anonKey
        }
      })

      const transactions = await transactionRes.json()
      const transaction = Array.isArray(transactions) && transactions.length > 0 ? transactions[0] : null

      if (transaction && transaction.status === 'pending') {
        // Update transaction using REST API
        const updateRes = await fetch(`${baseUrl}/rest/v1/transactions?id=eq.${transaction.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearer}`,
            'apikey': anonKey,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            status: 'completed',
            updated_at: new Date().toISOString()
          })
        })

        if (updateRes.ok) {
          console.log('Transaction updated to completed:', transaction.id)
        } else {
          console.error('Failed to update transaction:', await updateRes.text())
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