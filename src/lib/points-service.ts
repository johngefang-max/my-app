import { supabase, User, Generation, PointsTransaction, POINTS_CONFIG } from '@/lib/supabase'

// Points system service
export class PointsService {
  // Get user current points
  static async getUserPoints(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('users')
      .select('points')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user points:', error)
      throw error
    }

    return data?.points || 0
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
  }): Promise<{ generation: Generation, pointsDeducted: boolean }> {
    const cost = this.getGenerationCost(generationData.generation_type)

    // Check if user can afford this generation
    const canAfford = await this.canAffordGeneration(userId, generationData.generation_type)
    if (!canAfford) {
      throw new Error(`Insufficient points. Required: ${cost}, Available: ${await this.getUserPoints(userId)}`)
    }

    // Start a transaction-like operation
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('points')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      throw new Error('Failed to fetch user data')
    }

    const balanceBefore = user.points

    // Create generation record
    const { data: generation, error: genError } = await supabase
      .from('generations')
      .insert({
        ...generationData,
        user_id: userId,
        points_cost: cost,
        status: 'processing'
      })
      .select()
      .single()

    if (genError || !generation) {
      throw new Error('Failed to create generation record')
    }

    try {
      // Deduct points
      const { error: updateError } = await supabase
        .from('users')
        .update({
          points: balanceBefore - cost,
          total_points_spent: user.total_points_spent + cost,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        throw updateError
      }

      // Record points transaction
      const { error: transError } = await supabase
        .from('points_transactions')
        .insert({
          user_id: userId,
          amount: -cost,
          type: 'spent',
          description: `Generation: ${generationData.generation_type}`,
          related_generation_id: generation.id,
          balance_before: balanceBefore,
          balance_after: balanceBefore - cost
        })

      if (transError) {
        throw transError
      }

      return { generation, pointsDeducted: true }

    } catch (error) {
      // If points deduction fails, delete the generation record
      await supabase
        .from('generations')
        .delete()
        .eq('id', generation.id)

      throw new Error('Failed to deduct points. Generation cancelled.')
    }
  }

  // Refund points for failed generation
  static async refundPoints(userId: string, generationId: string, amount: number): Promise<void> {
    const { data: user } = await supabase
      .from('users')
      .select('points')
      .eq('id', userId)
      .single()

    if (!user) {
      throw new Error('User not found')
    }

    const balanceBefore = user.points
    const balanceAfter = balanceBefore + amount

    // Update user points
    const { error: updateError } = await supabase
      .from('users')
      .update({
        points: balanceAfter,
        total_points_spent: user.total_points_spent - amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      throw updateError
    }

    // Record refund transaction
    const { error: transError } = await supabase
      .from('points_transactions')
      .insert({
        user_id: userId,
        amount: amount,
        type: 'refunded',
        description: 'Refund for failed generation',
        related_generation_id: generationId,
        balance_before: balanceBefore,
        balance_after: balanceAfter
      })

    if (transError) {
      throw transError
    }

    // Update generation status
    await supabase
      .from('generations')
      .update({
        status: 'failed',
        error_message: 'Points refunded due to generation failure'
      })
      .eq('id', generationId)
  }

  // Update generation with successful result
  static async completeGeneration(generationId: string, result: {
    model_url?: string
    image_url?: string
    status: 'completed'
  }): Promise<void> {
    const { error } = await supabase
      .from('generations')
      .update({
        ...result,
        updated_at: new Date().toISOString()
      })
      .eq('id', generationId)

    if (error) {
      throw error
    }
  }

  // Get user's generation history
  static async getUserGenerations(userId: string, limit: number = 20): Promise<Generation[]> {
    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return data || []
  }

  // Get user's points transaction history
  static async getUserPointsHistory(userId: string, limit: number = 20): Promise<PointsTransaction[]> {
    const { data, error } = await supabase
      .from('points_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return data || []
  }

  // Award daily bonus points
  static async awardDailyBonus(userId: string): Promise<boolean> {
    // Check if user already received daily bonus
    const today = new Date().toISOString().split('T')[0]
    const { data: existingBonus } = await supabase
      .from('points_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'bonus')
      .eq('description', 'Daily bonus')
      .gte('created_at', today)
      .limit(1)

    if (existingBonus && existingBonus.length > 0) {
      return false // Already received daily bonus
    }

    const { data: user } = await supabase
      .from('users')
      .select('points')
      .eq('id', userId)
      .single()

    if (!user) {
      throw new Error('User not found')
    }

    const balanceBefore = user.points
    const bonus = POINTS_CONFIG.DAILY_BONUS
    const balanceAfter = balanceBefore + bonus

    // Update user points
    await supabase
      .from('users')
      .update({
        points: balanceAfter,
        total_points_earned: user.total_points_earned + bonus,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    // Record bonus transaction
    await supabase
      .from('points_transactions')
      .insert({
        user_id: userId,
        amount: bonus,
        type: 'bonus',
        description: 'Daily bonus',
        balance_before: balanceBefore,
        balance_after: balanceAfter
      })

    return true
  }

  // Award signup bonus
  static async awardSignupBonus(userId: string): Promise<void> {
    const { data: user } = await supabase
      .from('users')
      .select('points')
      .eq('id', userId)
      .single()

    if (!user) {
      throw new Error('User not found')
    }

    const balanceBefore = user.points
    const bonus = POINTS_CONFIG.SIGNUP_BONUS
    const balanceAfter = balanceBefore + bonus

    // Update user points
    await supabase
      .from('users')
      .update({
        points: balanceAfter,
        total_points_earned: user.total_points_earned + bonus,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    // Record bonus transaction
    await supabase
      .from('points_transactions')
      .insert({
        user_id: userId,
        amount: bonus,
        type: 'bonus',
        description: 'Signup bonus',
        balance_before: balanceBefore,
        balance_after: balanceAfter
      })
  }
}