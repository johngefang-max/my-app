import { getProductDescription } from './product-descriptions'

/**
 * Creem Payment Service
 * Handles integration with Creem payment system
 */

interface CreemConfig {
  apiKey: string
  apiSecret: string
  baseUrl: string
  productName: string
  returnUrl: string
}

interface CreemPaymentRequest {
  amount: number
  currency: string
  userId: string
  planId: string
  description?: string
}

interface CreemPaymentResponse {
  success: boolean
  paymentUrl?: string
  paymentId?: string
  error?: string
}

interface CreemPaymentCallback {
  paymentId: string
  status: 'success' | 'failed' | 'pending'
  amount: number
  currency: string
  userId: string
  planId: string
  timestamp: number
  signature: string
}

class CreemPaymentService {
  private config: CreemConfig

  constructor(config: CreemConfig) {
    this.config = config
  }

  /**
   * Create a payment request
   */
  async createPayment(request: CreemPaymentRequest): Promise<CreemPaymentResponse> {
    try {
      const payload = {
        product_name: this.config.productName,
        amount: request.amount,
        currency: request.currency,
        user_id: request.userId,
        plan_id: request.planId,
        description: request.description || this.getProductDescription(request.planId),
        return_url: this.config.returnUrl,
        callback_url: `${this.config.returnUrl}/api/payments/creem/callback`,
        timestamp: Date.now()
      }

      // Generate signature
      const signature = this.generateSignature(payload)

      const response = await fetch(`${this.config.baseUrl}/payments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          'X-Signature': signature
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        return {
          success: true,
          paymentUrl: data.payment_url,
          paymentId: data.payment_id
        }
      } else {
        return {
          success: false,
          error: data.error || 'Failed to create payment'
        }
      }
    } catch (error) {
      console.error('Creem payment creation error:', error)
      return {
        success: false,
        error: 'Payment service unavailable'
      }
    }
  }

  /**
   * Verify payment callback
   */
  verifyCallback(callback: CreemPaymentCallback): boolean {
    try {
      // Verify signature
      const expectedSignature = this.generateSignature({
        paymentId: callback.paymentId,
        status: callback.status,
        amount: callback.amount,
        currency: callback.currency,
        userId: callback.userId,
        planId: callback.planId,
        timestamp: callback.timestamp
      })

      return callback.signature === expectedSignature
    } catch (error) {
      console.error('Callback verification error:', error)
      return false
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(paymentId: string): Promise<CreemPaymentResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/payments/${paymentId}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey
        }
      })

      const data = await response.json()

      return {
        success: data.success,
        paymentId: data.payment_id,
        error: data.error
      }
    } catch (error) {
      console.error('Payment status check error:', error)
      return {
        success: false,
        error: 'Failed to check payment status'
      }
    }
  }

  /**
   * Generate HMAC signature for requests
   */
  private generateSignature(payload: any): string {
    const crypto = require('crypto')
    const sortedPayload = Object.keys(payload)
      .sort()
      .reduce((result: any, key: string) => {
        result[key] = payload[key]
        return result
      }, {})

    const payloadString = JSON.stringify(sortedPayload)
    return crypto
      .createHmac('sha256', this.config.apiSecret)
      .update(payloadString)
      .digest('hex')
  }

  /**
   * Get product description for payment
   */
  private getProductDescription(planId: string): string {
    return getProductDescription(planId, 'zh', 'standard')
  }
}

// Singleton instance
let creemService: CreemPaymentService | null = null

export function getCreemService(): CreemPaymentService {
  if (!creemService) {
    const config: CreemConfig = {
      apiKey: process.env.CREEM_API_KEY || '',
      apiSecret: process.env.CREEM_API_SECRET || '',
      baseUrl: process.env.CREEM_BASE_URL || 'https://api.creem.payments',
      productName: 'imageto3d',
      returnUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000'
    }

    creemService = new CreemPaymentService(config)
  }

  return creemService
}

export type { CreemConfig, CreemPaymentRequest, CreemPaymentResponse, CreemPaymentCallback }
export { CreemPaymentService }