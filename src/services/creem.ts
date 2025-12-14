/**
 * Creem Payment Service
 * 封装 Creem 支付系统的三个核心 API
 */

import crypto from 'crypto';

// 环境变量配置 - 使用测试环境
const CREEM_API_KEY = process.env.CREEM_API_KEY || 'creem_test_3sioDtbY5ADbmoODbQnNiW';
const CREEM_PRODUCT_ID = process.env.CREEM_PRODUCT_ID || 'prod_5JtwzQinzndziQS0Da8jkn';
const CREEM_API_URL = process.env.CREEM_API_URL || 'https://test-api.creem.io';
const CREEM_SUCCESS_URL = process.env.CREEM_SUCCESS_URL;

// 接口定义
export interface CreateCheckoutParams {
  productId?: string;
  requestId?: string;
  successUrl?: string;
}

export interface CreateCheckoutResponse {
  checkout_url: string;
  checkout_id?: string;
  [key: string]: any;
}

export interface RedirectParams {
  request_id?: string | null;
  checkout_id?: string | null;
  order_id?: string | null;
  customer_id?: string | null;
  subscription_id?: string | null;
  product_id?: string | null;
  signature?: string | null;
}

/**
 * 1. createCheckout API - 创建支付会话
 * @param params 支付参数
 * @returns 包含支付URL的响应
 */
export async function createCheckout(params: CreateCheckoutParams = {}): Promise<CreateCheckoutResponse> {
  try {
    // 获取格式化的API基础URL（确保没有尾部斜杠）
    const baseUrl = CREEM_API_URL.endsWith('/') ? CREEM_API_URL.slice(0, -1) : CREEM_API_URL;
    const apiUrl = `${baseUrl}/v1/checkouts`;

    // 构建请求参数
    const requestData: any = {
      product_id: params.productId || CREEM_PRODUCT_ID,
    };

    if (params.requestId) {
      requestData.request_id = params.requestId;
    }

    if (params.successUrl) {
      requestData.success_url = params.successUrl;
    } else if (CREEM_SUCCESS_URL) {
      requestData.success_url = CREEM_SUCCESS_URL;
    }

    console.log('Creating checkout with params:', requestData);

    // 发送请求（使用 fetch 替代 axios）
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'x-api-key': CREEM_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;

      if (response.status === 403) {
        errorMessage = 'Payment provider authentication failed (403). Please check your CREEM_API_KEY and CREEM_PRODUCT_ID configuration.';
        console.error('Creem API 403 Forbidden - Check API key and product ID:', errorText);
      } else if (response.status === 401) {
        errorMessage = 'Payment provider authentication failed (401). Invalid API key.';
        console.error('Creem API 401 Unauthorized - Invalid API key:', errorText);
      } else {
        console.error('Creem API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    console.log('Checkout response:', data);

    if (!data || !data.checkout_url) {
      throw new Error('API response does not contain checkout_url');
    }

    return data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    throw error;
  }
}

/**
 * 2. generateSignature - 生成签名
 * @param params 参数对象
 * @param apiKey API密钥 (可选，默认使用环境变量)
 * @returns 生成的签名
 */
export function generateSignature(params: Record<string, string | null | undefined>, apiKey?: string): string {
  try {
    const key = apiKey || CREEM_API_KEY;

    // 创建格式为 "key1=value1|key2=value2|...|salt=apiKey" 的数据字符串
    // 重要：不要对键进行排序 - 按照提供的顺序使用
    const data = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .concat(`salt=${key}`)
      .join('|');

    // 使用SHA-256哈希算法生成签名
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    return hash;
  } catch (error) {
    console.error('Error generating signature:', error);
    throw error;
  }
}

/**
 * 3. verifySignature - 验证签名
 * @param params 重定向参数
 * @param signature 要验证的签名
 * @param apiKey API密钥 (可选，默认使用环境变量)
 * @returns 签名是否有效
 */
export function verifySignature(
  params: Record<string, string | null>,
  signature: string,
  apiKey?: string
): boolean {
  try {
    const key = apiKey || CREEM_API_KEY;

    // 过滤掉null/undefined值，并移除signature参数
    const filteredParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && key !== 'signature') {
        filteredParams[key] = value;
      }
    });

    // 生成预期的签名
    const computedSignature = generateSignature(filteredParams, key);

    // 比较计算的签名与接收到的签名
    return computedSignature === signature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

/**
 * 从URL参数中提取和验证签名
 * @param searchParams URL搜索参数
 * @returns 验证结果和提取的参数
 */
export function extractAndVerifySignature(searchParams: URLSearchParams): {
  isValid: boolean;
  params: RedirectParams;
} {
  const params: RedirectParams = {};

  // 提取所有可能的参数
  const possibleParams = [
    'request_id', 'checkout_id', 'order_id',
    'customer_id', 'subscription_id', 'product_id', 'signature'
  ];

  possibleParams.forEach(param => {
    const value = searchParams.get(param);
    if (value) {
      params[param as keyof RedirectParams] = value;
    }
  });

  // 如果没有签名，直接返回无效
  if (!params.signature) {
    console.error('No signature found in parameters');
    return { isValid: false, params };
  }

  // 验证签名
  const isValid = verifySignature(params as Record<string, string | null>, params.signature);

  return { isValid, params };
}

// 导出服务类，便于管理和扩展
export class CreemPaymentService {
  private apiKey: string;
  private productId: string;
  private successUrl: string;

  constructor(
    apiKey: string = CREEM_API_KEY!,
    productId: string = CREEM_PRODUCT_ID!,
    successUrl: string = CREEM_SUCCESS_URL!
  ) {
    if (!apiKey) throw new Error('API key is required');
    if (!productId) throw new Error('Product ID is required');

    this.apiKey = apiKey;
    this.productId = productId;
    this.successUrl = successUrl;
  }

  /**
   * 创建支付会话
   */
  async createPayment(requestId?: string): Promise<CreateCheckoutResponse> {
    return createCheckout({
      productId: this.productId,
      requestId: requestId,
      successUrl: this.successUrl
    });
  }

  /**
   * 验证回调签名
   */
  verifyCallbackSignature(params: RedirectParams): boolean {
    if (!params.signature) return false;

    return verifySignature(params as Record<string, string | null>, params.signature, this.apiKey);
  }

  /**
   * 生成签名（用于测试）
   */
  generateTestSignature(params: Record<string, string>): string {
    return generateSignature(params, this.apiKey);
  }
}

// 创建默认实例
export const creemService = new CreemPaymentService();

// 导出所有功能
export default {
  createCheckout,
  generateSignature,
  verifySignature,
  extractAndVerifySignature,
  CreemPaymentService,
  creemService
};