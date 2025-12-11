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
各文件详细功能
1. signatureUtils.ts:
  - 核心功能：生成符合Creem规范的签名
  - 工作方式：将参数按照key1=value1|key2=value2|...|salt=apiKey格式连接，然后使用SHA-256哈希算法生成签名
  - 被verifySignature.ts调用来验证签名
2. verifySignature.ts:
  - 核心功能：验证从Creem重定向回来的URL中的签名
  - 工作方式：过滤参数，移除signature参数，调用generateSignature生成签名，然后与URL中的签名比较
  - 被SuccessContent.tsx组件调用来验证支付结果
3. createCheckout.ts:
  - 核心功能：调用Creem API创建结账会话
  - 工作方式：使用axios发送POST请求到Creem API，返回包含checkout_url的响应
  - 被app/api/create-checkout/route.ts调用
4. app/api/create-checkout/route.ts:
  - 核心功能：处理前端支付请求
  - 工作方式：接收前端请求，验证参数，调用createCheckout服务，返回结果
  - 被app/page.tsx中的支付按钮点击事件调用