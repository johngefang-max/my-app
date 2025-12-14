2.2 一次性付费（Return URL）
一句话说逻辑就是：配置规则在这里，我有这些配置信息，我希望实现什么效果，你帮我写
划重点“配置信息”、“配置规则”、“实现效果”
就是这3个内容，配置信息上面我们已经搞定，接下来就是配置规则和实现效果

先确定我们这一次的实现效果

⚠️整个操作，不涉及用户注册和登录，所以也挺容易实现的，别害怕，即使是后面有注册和登录，也都有第三方集成，莫慌！

这个实现逻辑，我们是需要有一个使用参数`success_url`和`signature验证`直接看到对应文档官方解释
1. 您可以为每个 checkout_session 传递一个自定义的success_url，它将覆盖success_url产品上的设置。这使得您可以在每次付款后动态地将用户重定向到自定义页面（对于在付款后将用户引导到他们的特定帐户资源很有用）。
2. 返回和重定向 URL 是成功付款后您的客户将被重定向到的 URL。它们包含由 creem 签名的重要信息，您可以使用这些信息来验证付款和用户。
划重点：付款成功，重定向的自定义页面，使用信息验证付款（和用户）

一次性付费总共需要3个API：创建checkout、生成signature、验证signature
API1:创建会话
const redirectUrl = await axios.post(
      `https://api.creem.io/v1/checkouts`,
        {
          "success_url": "https://example.com",
          "product_id": "prod_your-product-id",
        },
        {
          headers: { "x-api-key": `creem_123456789` },
        },
    );

看起来吓人，实际上就4个东西：
1. https://api.creem.io/v1/checkouts支付连接(固定的，测试和生产2个不同连接)
2. success_url": "https://example.com 支付成功以后你要去到的页面path（路径）
3. "product_id": "prod_your-product-id 换成你的产品id
4. "x-api-key": `creem_123456789 换成你的api key（测试和生产2个不同）
我的文件如下：
import axios from 'axios';

export interface CreateCheckoutParams {
  productId: string;
  requestId?: string;
  successUrl?: string;
}

export interface CreateCheckoutResponse {
  checkout_url: string;
  [key: string]: any;
}

/**
 * 创建Creem结账会话
 * @param params 结账参数
 * @returns 包含结账URL的响应
 */
export async function createCheckout(params: CreateCheckoutParams): Promise<CreateCheckoutResponse> {
  try {
    const API_URL = process.env.CREEM_API_URL || 'https://test-api.creem.io';
    const API_KEY = process.env.CREEM_API_KEY || 'creem_test_3sioDtbY5ADbmoODbQnNiW';
    
    // 获取格式化的API基础URL（确保没有尾部斜杠）
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const apiUrl = `${baseUrl}/v1/checkouts`;

    const response = await axios.post(
      apiUrl,
      {
        product_id: params.productId,
        request_id: params.requestId,
        success_url: params.successUrl,
      },
      {
        headers: { 'x-api-key': API_KEY },
      }
    );

    if (!response.data || !response.data.checkout_url) {
      throw new Error('API response does not contain checkout_url');
    }

    return response.data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('API error response:', error.response.data);
    }
    throw error;
  }
}

[图片]
(GPT的解读，下面的你也可以发给任意ai去看看写的到底是什么)

API2:生成signture
import crypto from 'crypto';

/**
 * 生成Creem签名
 * @param params 参数对象
 * @param apiKey API密钥
 * @returns 生成的签名
 */
export function generateSignature(params: Record<string, string>, apiKey: string): string {
  // 创建格式为 "key1=value1|key2=value2|...|salt=apiKey" 的数据字符串
  // 重要：不要对键进行排序 - 按照提供的顺序使用
  const data = Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .concat(`salt=${apiKey}`)
    .join('|');

  // 使用SHA-256哈希算法生成签名
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return hash;
}

API3:验证签名signature
import { generateSignature } from './signatureUtils';

export interface RedirectParams {
  request_id?: string | null;
  checkout_id?: string | null;
  order_id?: string | null;
  customer_id?: string | null;
  subscription_id?: string | null;
  product_id?: string | null;
}

/**
 * 验证Creem签名
 * @param params 重定向参数
 * @param signature 要验证的签名
 * @returns 签名是否有效
 */
export function verifySignature(params: Record<string, string>, signature: string): boolean {
  try {
    const API_KEY = process.env.CREEM_API_KEY || 'creem_test_3sioDtbY5ADbmoODbQnNiW';

    // 过滤掉null/undefined值，并移除signature参数（如果存在）
    const filteredParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && key !== 'signature') {
        filteredParams[key] = value;
      }
    });

    // 使用Creem提供的方法生成签名
    const computedSignature = generateSignature(filteredParams, API_KEY);
    
    // 比较计算的签名与接收到的签名
    return computedSignature === signature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}
