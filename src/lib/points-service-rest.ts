import { POINTS_CONFIG } from './supabase'

// Database configuration
function getDbConfig() {
  const baseUrl = process.env.my_app_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_my_app_SUPABASE_URL || ''
  const serviceKey = process.env.my_app_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const anonKey = process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.my_app_SUPABASE_ANON_KEY || ''

  return { baseUrl, serviceKey, anonKey, bearer: serviceKey || anonKey }
}

// Points system service using REST API
export class PointsService {
  // Get user current points
  static async getUserPoints(userId: string): Promise<number> {
    const { baseUrl, bearer, anonKey } = getDbConfig()

    const response = await fetch(`${baseUrl}/rest/v1/users?id=eq.${userId}&select=points`, {
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user points')
    }

    const users = await response.json()
    return users[0]?.points || 0
  }

  // Check if user has enough points for a generation
  static async canAffordGeneration(userId: string, generationType: string): Promise<boolean> {
    const userPoints = await this.getUserPoints(userId)
    const cost = POINTS_CONFIG.GENERATION_COSTS[generationType as keyof typeof POINTS_CONFIG.GENERATION_COSTS] || 0
    return userPoints >= cost
  }

  // Get generation cost
  static getGenerationCost(generationType: string): number {
    return POINTS_CONFIG.GENERATION_COSTS[generationType as keyof typeof POINTS_CONFIG.GENERATION_COSTS] || 0
  }

  // Create a generation record and deduct points
  static async createGeneration(userId: string, generationData: {
    title: string
    description?: string
    model_type: '3d' | 'image'
    generation_type: 'text-to-image' | 'image-edit' | 'image-to-3d' | 'text-to-3d'
    model_id: string
    parameters?: any
  }): Promise<{ generation: any, pointsDeducted: boolean }> {
    const { baseUrl, bearer, anonKey } = getDbConfig()
    const cost = this.getGenerationCost(generationData.generation_type)

    // Check if user can afford this generation
    const canAfford = await this.canAffordGeneration(userId, generationData.generation_type)
    if (!canAfford) {
      const userPoints = await this.getUserPoints(userId)
      throw new Error(`Insufficient points. Required: ${cost}, Available: ${userPoints}`)
    }

    // Get user current data
    const userResponse = await fetch(`${baseUrl}/rest/v1/users?id=eq.${userId}&select=points,total_points_spent,total_points_earned`, {
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey
      }
    })

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data')
    }

    const users = await userResponse.json()
    const user = users[0]

    if (!user) {
      throw new Error('User not found')
    }

    const balanceBefore = user.points
    const balanceAfter = balanceBefore - cost

    // Create generation record
    const genResponse = await fetch(`${baseUrl}/rest/v1/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        ...generationData,
        user_id: userId,
        points_cost: cost,
        status: 'processing'
      })
    })

    if (!genResponse.ok) {
      throw new Error('Failed to create generation record')
    }

    const generations = await genResponse.json()
    const generation = generations[0]

    try {
      // Update user points
      const updateResponse = await fetch(`${baseUrl}/rest/v1/users?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearer}`,
          'apikey': anonKey,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          points: balanceAfter,
          total_points_spent: user.total_points_spent + cost
        })
      })

      if (!updateResponse.ok) {
        throw new Error('Failed to update user points')
      }

      // Record points transaction
      const transResponse = await fetch(`${baseUrl}/rest/v1/points_transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearer}`,
          'apikey': anonKey,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: userId,
          amount: -cost,
          type: 'spent',
          description: `Generation: ${generationData.generation_type}`,
          related_generation_id: generation.id,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          created_at: new Date().toISOString()
        })
      })

      if (!transResponse.ok) {
        // Log error but don't fail the entire operation
        console.error('Failed to record points transaction:', await transResponse.text())
      }

      return { generation, pointsDeducted: true }

    } catch (error) {
      // If points deduction fails, delete the generation record
      await fetch(`${baseUrl}/rest/v1/generations?id=eq.${generation.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${bearer}`,
          'apikey': anonKey
        }
      })

      throw new Error('Failed to deduct points. Generation cancelled.')
    }
  }

  // Refund points for failed generation
  static async refundPoints(userId: string, generationId: string, amount: number): Promise<void> {
    const { baseUrl, bearer, anonKey } = getDbConfig()

    // Get user current points
    const userResponse = await fetch(`${baseUrl}/rest/v1/users?id=eq.${userId}&select=points,total_points_spent`, {
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey
      }
    })

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data for refund')
    }

    const users = await userResponse.json()
    const user = users[0]

    if (!user) {
      throw new Error('User not found for refund')
    }

    const balanceBefore = user.points
    const balanceAfter = balanceBefore + amount

    // Update user points
    const updateResponse = await fetch(`${baseUrl}/rest/v1/users?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        points: balanceAfter,
        total_points_spent: user.total_points_spent - amount
      })
    })

    if (!updateResponse.ok) {
      throw new Error('Failed to refund points')
    }

    // Record refund transaction
    await fetch(`${baseUrl}/rest/v1/points_transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: userId,
        amount: amount,
        type: 'refund',
        description: `Refund for failed generation: ${generationId}`,
        related_generation_id: generationId,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        created_at: new Date().toISOString()
      })
    })
  }

  // Complete generation (update status)
  static async completeGeneration(generationId: string, updateData: {
    model_url?: string
    image_url?: string
    status: string
  }): Promise<void> {
    const { baseUrl, bearer, anonKey } = getDbConfig()

    const response = await fetch(`${baseUrl}/rest/v1/generations?id=eq.${generationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        ...updateData,
        updated_at: new Date().toISOString()
      })
    })

    if (!response.ok) {
      throw new Error('Failed to update generation status')
    }
  }
}