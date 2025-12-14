import { NextRequest, NextResponse } from 'next/server'
import { extractAndVerifySignature } from '@/services/creem'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 提取 Creem 返回的所有参数
    const params = {
      request_id: searchParams.get('request_id'),
      checkout_id: searchParams.get('checkout_id'),
      order_id: searchParams.get('order_id'),
      customer_id: searchParams.get('customer_id'),
      subscription_id: searchParams.get('subscription_id'),
      product_id: searchParams.get('product_id'),
      signature: searchParams.get('signature')
    }

    console.log('Payment return params:', params)

    // 验证签名
    if (!params.signature) {
      console.error('No signature in payment return')
      return NextResponse.redirect(
        new URL('/payment/failed?reason=no_signature', request.url)
      )
    }

    // 验证签名有效性
    const { isValid } = extractAndVerifySignature(searchParams)
    if (!isValid) {
      console.error('Invalid signature in payment return')
      return NextResponse.redirect(
        new URL('/payment/failed?reason=invalid_signature', request.url)
      )
    }

    // 验证必要参数
    if (!params.order_id || !params.customer_id || !params.checkout_id) {
      console.error('Missing required parameters:', { order_id: params.order_id, customer_id: params.customer_id, checkout_id: params.checkout_id })
      return NextResponse.redirect(
        new URL('/payment/failed?reason=missing_params', request.url)
      )
    }

    // 初始化 Supabase 配置
    const baseUrl = process.env.my_app_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_my_app_SUPABASE_URL
    const serviceKey = process.env.my_app_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const anonKey = process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.my_app_SUPABASE_ANON_KEY || ''
    const bearer = serviceKey || anonKey

    // 查找对应的交易记录
    const transactionRes = await fetch(`${baseUrl}/rest/v1/transactions?metadata->>checkout_id=eq.${params.checkout_id}&user_id=eq.${params.customer_id}`, {
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey
      }
    })

    const transactions = await transactionRes.json()
    const transaction = Array.isArray(transactions) && transactions.length > 0 ? transactions[0] : null

    if (transaction) {
      // 更新交易状态
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
          metadata: {
            ...transaction.metadata,
            order_id: params.order_id,
            subscription_id: params.subscription_id,
            payment_provider: 'creem'
          },
          updated_at: new Date().toISOString()
        })
      })

      if (updateRes.ok) {
        console.log('Transaction updated to completed:', transaction.id)
      } else {
        console.error('Failed to update transaction:', await updateRes.text())
      }
    } else {
      console.log('No transaction found, creating new one...')

      // 创建新的交易记录
      const createRes = await fetch(`${baseUrl}/rest/v1/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearer}`,
          'apikey': anonKey,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          user_id: params.customer_id,
          type: 'subscription',
          amount: 999, // $9.99 in cents
          currency: 'USD',
          status: 'completed',
          metadata: {
            checkout_id: params.checkout_id,
            order_id: params.order_id,
            subscription_id: params.subscription_id,
            product_id: params.product_id,
            payment_provider: 'creem'
          }
        })
      })

      if (createRes.ok) {
        console.log('Transaction created successfully')
      } else {
        console.error('Failed to create transaction:', await createRes.text())
      }
    }

    // 更新用户订阅状态
    const subscriptionData = {
      plan: 'pro_monthly',
      subscription_status: 'active',
      subscribed_at: new Date().toISOString(),
      subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30天
    }

    const updateUserRes = await fetch(`${baseUrl}/rest/v1/users?id=eq.${params.customer_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(subscriptionData)
    })

    if (updateUserRes.ok) {
      console.log('User subscription updated successfully')
    } else {
      console.error('Failed to update user subscription:', await updateUserRes.text())
    }

    // 添加订阅奖励积分
    try {
      await fetch(`${baseUrl}/rest/v1/points_transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearer}`,
          'apikey': anonKey,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: params.customer_id,
          amount: 100, // Pro订阅奖励100积分
          type: 'bonus',
          description: 'Pro subscription bonus',
          created_at: new Date().toISOString()
        })
      })
    } catch (pointsError) {
      console.error('Error adding bonus points:', pointsError)
    }

    // 重定向到成功页面，传递所有相关信息
    const redirectUrl = new URL('/payment/success', request.url)
    redirectUrl.searchParams.set('order_id', params.order_id || '')
    redirectUrl.searchParams.set('checkout_id', params.checkout_id || '')
    redirectUrl.searchParams.set('subscription_id', params.subscription_id || '')
    redirectUrl.searchParams.set('plan', 'pro_monthly')

    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('Payment return error:', error)
    return NextResponse.redirect(
      new URL('/payment/failed?reason=processing_failed', request.url)
    )
  }
}