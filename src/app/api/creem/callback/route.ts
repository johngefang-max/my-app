import { NextRequest, NextResponse } from 'next/server';
import { extractAndVerifySignature } from '@/services/creem';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 提取和验证签名
    const { isValid, params } = extractAndVerifySignature(searchParams);

    if (!isValid) {
      console.error('Invalid signature in callback');
      return NextResponse.redirect(
        new URL('/payment/failed?reason=invalid_signature', request.url)
      );
    }

    console.log('Payment callback verified successfully:', params);

    // 获取订单信息
    const { checkout_id, order_id, customer_id, product_id } = params;

    if (!checkout_id || !order_id || !customer_id) {
      console.error('Missing required parameters:', { checkout_id, order_id, customer_id });
      return NextResponse.redirect(
        new URL('/payment/failed?reason=missing_params', request.url)
      );
    }

    // 查找对应的交易记录
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('metadata->>checkout_id', checkout_id)
      .eq('user_id', customer_id)
      .single();

    if (transactionError && transactionError.code !== 'PGRST116') {
      console.error('Database error:', transactionError);
      return NextResponse.redirect(
        new URL('/payment/failed?reason=database_error', request.url)
      );
    }

    // 如果没有找到交易记录，创建一个新的
    if (!transaction) {
      console.log('Creating new transaction record');

      // 确定订阅类型
      const planType = product_id === 'prod_5JtwzQinzndziQS0Da8jkn' ? 'pro_monthly' : 'free';

      const { error: insertError } = await supabase
        .from('transactions')
        .insert({
          user_id: customer_id,
          type: 'subscription',
          amount: planType === 'pro_monthly' ? 999 : 0, // $9.99 in cents
          currency: 'USD',
          status: 'completed',
          metadata: {
            checkout_id,
            order_id,
            product_id,
            payment_provider: 'creem'
          }
        });

      if (insertError) {
        console.error('Error creating transaction:', insertError);
        return NextResponse.redirect(
          new URL('/payment/failed?reason=transaction_error', request.url)
        );
      }
    } else {
      // 更新现有交易状态
      await supabase
        .from('transactions')
        .update({
          status: 'completed',
          metadata: {
            ...transaction.metadata,
            order_id,
            payment_provider: 'creem'
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id);
    }

    // 更新用户订阅状态
    const subscriptionData = {
      plan: 'pro_monthly',
      subscription_status: 'active',
      subscribed_at: new Date().toISOString(),
      subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30天
    };

    const { error: updateError } = await supabase
      .from('users')
      .update(subscriptionData)
      .eq('id', customer_id);

    if (updateError) {
      console.error('Error updating user subscription:', updateError);
      // 不重定向到失败页面，因为支付已经成功
    }

    // 添加订阅奖励积分
    try {
      await supabase.from('points_transactions').insert({
        user_id: customer_id,
        amount: 100, // Pro订阅奖励100积分
        type: 'bonus',
        description: 'Pro subscription bonus',
        balance_before: 0, // 会在points service中更新
        balance_after: 0
      });
    } catch (pointsError) {
      console.error('Error adding bonus points:', pointsError);
    }

    // 重定向到成功页面，传递订单信息
    const redirectUrl = new URL('/payment/success', request.url);
    redirectUrl.searchParams.set('order_id', order_id);
    redirectUrl.searchParams.set('checkout_id', checkout_id);
    redirectUrl.searchParams.set('plan', 'pro_monthly');

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.redirect(
      new URL('/payment/failed?reason=server_error', request.url)
    );
  }
}