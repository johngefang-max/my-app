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

    try {
      const response = await fetch(`${baseUrl}/rest/v1/users?id=eq.${userId}&select=points`, {
        headers: {
          'Authorization': `Bearer ${bearer}`,
          'apikey': anonKey
        }
      })

      if (!response.ok) {
        console.error('Failed to fetch user points:', response.status, response.statusText)
        throw new Error('Failed to fetch user points')
      }

      const users = await response.json()
      const userPoints = users && users.length > 0 ? users[0].points : 0
      console.log('User points query result:', { userId, points: userPoints })
      return userPoints
    } catch (error) {
      console.error('getUserPoints error:', error)
      throw error
    }
  }

  // Check if user has enough points for a generation
  static async canAffordGeneration(userId: string, generationType: string): Promise<boolean> {
    try {
      const userPoints = await this.getUserPoints(userId)
      const cost = POINTS_CONFIG.GENERATION_COSTS[generationType as keyof typeof POINTS_CONFIG.GENERATION_COSTS] || 0
      console.log('Can afford check:', { userId, userPoints, cost, canAfford: userPoints >= cost })
      return userPoints >= cost
    } catch (error) {
      console.error('canAffordGeneration error:', error)
      return false
    }
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

    console.log('Starting createGeneration:', { userId, generationType: generationData.generation_type, cost })

    try {
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
        console.error('Failed to fetch user data:', userResponse.status, userResponse.statusText)
        throw new Error('Failed to fetch user data')
      }

      const users = await userResponse.json()
      const user = users[0]

      if (!user) {
        console.error('User not found for ID:', userId)
        throw new Error('User not found')
      }

      const balanceBefore = user.points
      const balanceAfter = balanceBefore - cost

      console.log('Point deduction attempt:', { balanceBefore, cost, balanceAfter })

      // First, create generation record
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
        console.error('Failed to create generation record:', genResponse.status)
        const errorText = await genResponse.text()
        throw new Error(`Failed to create generation record: ${errorText}`)
      }

      const generations = await genResponse.json()
      const generation = generations[0]
      console.log('Generation record created:', generation.id)

      // Then, update user points
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
          total_points_spent: (user.total_points_spent || 0) + cost
        })
      })

      if (!updateResponse.ok) {
        console.error('Failed to update user points:', updateResponse.status)
        // Delete the generation record since points deduction failed
        await fetch(`${baseUrl}/rest/v1/generations?id=eq.${generation.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${bearer}`,
            'apikey': anonKey
          }
        })
        throw new Error('Failed to update user points')
      }

      console.log('User points updated successfully')

      // Finally, record points transaction (optional - don't fail if this fails)
      try {
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
          console.warn('Failed to record points transaction:', await transResponse.text())
        }
      } catch (transError) {
        console.warn('Points transaction recording failed:', transError)
        // Don't fail the operation
      }

      console.log('PointsService.createGeneration completed successfully')
      return { generation, pointsDeducted: true }

    } catch (error) {
      console.error('createGeneration error:', error)
      throw error
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