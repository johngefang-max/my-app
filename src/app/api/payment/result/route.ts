import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Webhook 密钥（从环境变量获取）
const WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET || 'whsec_2k2SVxpBkLK7W80HLpc94W'

// 验证 webhook 签名
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    // Creem 使用 HMAC-SHA256 签名
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex')

    // 比较签名（可能需要处理前缀）
    const receivedSignature = signature.startsWith('sha256=')
      ? signature.substring(7)
      : signature

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    )
  } catch (error) {
    console.error('Webhook signature verification error:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Creem Webhook Received ===')

    // 获取请求头
    const signature = request.headers.get('creem-signature') || request.headers.get('x-creem-signature')

    if (!signature) {
      console.error('No signature found in webhook headers')
      return NextResponse.json(
        { error: 'No signature' },
        { status: 401 }
      )
    }

    // 获取请求体
    const payload = await request.text()
    console.log('Webhook payload:', payload)

    // 验证签名
    if (!verifyWebhookSignature(payload, signature, WEBHOOK_SECRET)) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // 解析事件数据
    const event = JSON.parse(payload)
    console.log('Webhook event:', event)

    // 处理不同类型的事件
    switch (event.type) {
      case 'payment.succeeded':
      case 'checkout.completed':
        await handlePaymentSuccess(event.data)
        break

      case 'payment.failed':
      case 'checkout.failed':
        await handlePaymentFailed(event.data)
        break

      case 'subscription.created':
        await handleSubscriptionCreated(event.data)
        break

      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data)
        break

      default:
        console.log('Unhandled event type:', event.type)
    }

    // 返回成功响应
    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    )
  }
}

// 处理支付成功
async function handlePaymentSuccess(data: any) {
  console.log('Processing payment success:', data)

  try {
    // 初始化 Supabase 配置
    const baseUrl = process.env.my_app_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_my_app_SUPABASE_URL
    const serviceKey = process.env.my_app_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const anonKey = process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.my_app_SUPABASE_ANON_KEY || ''
    const bearer = serviceKey || anonKey

    const { checkout_id, order_id, customer_id, product_id } = data

    // 查找并更新交易记录
    const transactionRes = await fetch(`${baseUrl}/rest/v1/transactions?metadata->>checkout_id=eq.${checkout_id}&user_id=eq.${customer_id}`, {
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey
      }
    })

    const transactions = await transactionRes.json()
    const transaction = Array.isArray(transactions) && transactions.length > 0 ? transactions[0] : null

    if (transaction) {
      // 更新现有交易
      await fetch(`${baseUrl}/rest/v1/transactions?id=eq.${transaction.id}`, {
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
            order_id,
            payment_provider: 'creem'
          },
          updated_at: new Date().toISOString()
        })
      })

      console.log('Transaction updated via webhook:', transaction.id)
    }

    // 更新用户订阅状态
    const subscriptionData = {
      plan: product_id === 'prod_5JtwzQinzndziQS0Da8jkn' ? 'pro_monthly' : 'free',
      subscription_status: 'active',
      subscribed_at: new Date().toISOString(),
      subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    await fetch(`${baseUrl}/rest/v1/users?id=eq.${customer_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(subscriptionData)
    })

    console.log('User subscription updated via webhook:', customer_id)

  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

// 处理支付失败
async function handlePaymentFailed(data: any) {
  console.log('Processing payment failed:', data)

  try {
    // 类似的逻辑，但标记为失败
    // ...
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

// 处理订阅创建
async function handleSubscriptionCreated(data: any) {
  console.log('Processing subscription created:', data)
  // 处理订阅创建逻辑
}

// 处理订阅更新
async function handleSubscriptionUpdated(data: any) {
  console.log('Processing subscription updated:', data)
  // 处理订阅更新逻辑
}