/**
 * Creem 签名验证测试
 * 用于验证签名生成和验证功能是否正常工作
 */

import { generateSignature, verifySignature, creemService } from '../../services/creem';

// 测试参数（模拟Creem回调参数）
const testParams = {
  request_id: 'req_test_123456789',
  checkout_id: 'chk_test_987654321',
  order_id: 'order_test_abc123',
  customer_id: 'cus_test_xyz789',
  product_id: 'prod_5JtwzQinzndziQS0Da8jkn'
};

/**
 * 测试签名生成和验证
 */
export async function testSignatureVerification(): Promise<boolean> {
  console.log('🔍 开始测试 Creem 签名验证功能...\n');

  try {
    // 1. 生成签名
    console.log('1️⃣ 生成签名测试');
    console.log('测试参数:', testParams);

    const signature = generateSignature(testParams);
    console.log('生成的签名:', signature);
    console.log('✅ 签名生成成功\n');

    // 2. 验证正确的签名
    console.log('2️⃣ 验证正确签名测试');
    const isValidCorrect = verifySignature(testParams, signature);
    console.log('验证结果:', isValidCorrect ? '✅ 通过' : '❌ 失败');
    console.log('');

    // 3. 验证错误的签名
    console.log('3️⃣ 验证错误签名测试');
    const wrongSignature = 'invalid_signature_hash';
    const isValidWrong = verifySignature(testParams, wrongSignature);
    console.log('验证结果:', !isValidWrong ? '✅ 通过（正确拒绝了错误签名）' : '❌ 失败（错误签名被接受了）');
    console.log('');

    // 4. 测试参数顺序敏感性（不应该排序）
    console.log('4️⃣ 测试参数顺序敏感性');
    const reorderedParams = {
      product_id: testParams.product_id,
      request_id: testParams.request_id,
      checkout_id: testParams.checkout_id,
      order_id: testParams.order_id,
      customer_id: testParams.customer_id
    };

    const signatureReordered = generateSignature(reorderedParams);
    const isOrderSensitive = signature !== signatureReordered;
    console.log('参数顺序测试:', isOrderSensitive ? '✅ 通过（参数顺序影响签名）' : '❌ 失败（参数顺序不影响签名）');
    console.log('');

    // 5. 测试null/undefined值过滤
    console.log('5️⃣ 测试null/undefined值过滤');
    const paramsWithNull = {
      ...testParams,
      subscription_id: null,
      extra_param: undefined,
      another_param: ''
    };

    const signatureWithNull = generateSignature(paramsWithNull as any);
    const isValidWithNull = verifySignature(paramsWithNull as any, signatureWithNull);
    console.log('null值过滤测试:', isValidWithNull ? '✅ 通过' : '❌ 失败');
    console.log('');

    // 6. 测试服务类
    console.log('6️⃣ 测试 CreemPaymentService 类');
    const serviceSignature = creemService.generateTestSignature(testParams);
    const isServiceValid = creemService.verifyCallbackSignature({
      ...testParams,
      signature: serviceSignature
    });
    console.log('服务类测试:', isServiceValid ? '✅ 通过' : '❌ 失败');
    console.log('');

    // 7. 总结测试结果
    console.log('📊 测试总结:');
    console.log('- 签名生成: ✅');
    console.log('- 正确签名验证:', isValidCorrect ? '✅' : '❌');
    console.log('- 错误签名拒绝:', !isValidWrong ? '✅' : '❌');
    console.log('- 参数顺序敏感:', isOrderSensitive ? '✅' : '❌');
    console.log('- null值处理:', isValidWithNull ? '✅' : '❌');
    console.log('- 服务类功能:', isServiceValid ? '✅' : '❌');

    const allTestsPassed = isValidCorrect && !isValidWrong && isOrderSensitive && isValidWithNull && isServiceValid;

    console.log('\n' + '='.repeat(50));
    console.log(allTestsPassed ? '🎉 所有测试通过！' : '❌ 部分测试失败');
    console.log('='.repeat(50));

    return allTestsPassed;

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    return false;
  }
}

/**
 * 测试 createCheckout 功能（需要有效的API密钥）
 */
export async function testCreateCheckout(): Promise<boolean> {
  console.log('🛒 开始测试 createCheckout 功能...\n');

  try {
    const { createCheckout } = await import('../../services/creem');

    console.log('1️⃣ 测试创建支付会话');
    console.log('使用配置的产品ID:', process.env.CREEM_PRODUCT_ID);

    const response = await createCheckout({
      requestId: `test_${Date.now()}`,
      successUrl: 'https://imageto3d.site/payment/success'
    });

    console.log('✅ 支付会话创建成功');
    console.log('支付URL:', response.checkout_url);

    if (response.checkout_id) {
      console.log('会话ID:', response.checkout_id);
    }

    console.log('\n🎉 createCheckout 测试通过！');
    return true;

  } catch (error) {
    console.error('❌ createCheckout 测试失败:', error);

    if (error instanceof Error) {
      console.error('错误详情:', error.message);
    }

    return false;
  }
}

/**
 * 运行所有测试
 */
export async function runAllTests(): Promise<void> {
  console.log('🚀 开始运行 Creem API 测试套件\n');
  console.log('='.repeat(60));

  // 测试签名验证
  const signatureTestPassed = await testSignatureVerification();
  console.log('\n');

  // 测试支付会话创建（仅在有API密钥时运行）
  if (process.env.CREEM_API_KEY && process.env.CREEM_PRODUCT_ID) {
    const checkoutTestPassed = await testCreateCheckout();
    console.log('\n');

    if (signatureTestPassed && checkoutTestPassed) {
      console.log('🎊 所有测试都通过了！Creem API 集成准备就绪。');
    } else {
      console.log('⚠️ 部分测试失败，请检查配置和实现。');
    }
  } else {
    console.log('⚠️ 跳过 createCheckout 测试（缺少 API_KEY 或 PRODUCT_ID）');

    if (signatureTestPassed) {
      console.log('✅ 签名验证测试通过，签名功能正常工作。');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('测试完成！');
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  runAllTests().catch(console.error);
}