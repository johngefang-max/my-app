import { NextRequest, NextResponse } from 'next/server'
import { PointsService } from '@/lib/points-service-rest'

export async function POST(request: NextRequest) {
  try {
    const { userId, action } = await request.json()

    console.log('Points test request:', { userId, action })

    if (action === 'check_balance') {
      const balance = await PointsService.getUserPoints(userId)
      return NextResponse.json({ success: true, balance })
    }

    if (action === 'test_can_afford') {
      const { generationType } = await request.json()
      const canAfford = await PointsService.canAffordGeneration(userId, generationType)
      const cost = PointsService.getGenerationCost(generationType)
      return NextResponse.json({ success: true, canAfford, cost })
    }

    if (action === 'test_deduction') {
      const { generationType } = await request.json()
      const cost = PointsService.getGenerationCost(generationType)

      // Test creating a generation record
      const result = await PointsService.createGeneration(userId, {
        title: 'Test generation',
        description: 'Test deduction',
        model_type: 'image',
        generation_type: generationType as any,
        model_id: 'test-model',
        parameters: {}
      })

      return NextResponse.json({ success: true, result })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

  } catch (error) {
    console.error('Points test error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Test failed',
      details: error
    }, { status: 500 })
  }
}