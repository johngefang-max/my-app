import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { modelId, title, description } = await request.json()
    
    // Validate input
    if (!modelId) {
      return NextResponse.json(
        { error: 'Model ID is required' },
        { status: 400 }
      )
    }

    // Get user ID from authorization header (simplified)
    const authHeader = request.headers.get('authorization')
    let userId = 'demo-user-id' // Default for demo
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // In a real app, you'd verify the JWT token here
      userId = authHeader.replace('Bearer ', '')
    }

    // Update model with title and description
    const { data: modelData, error: modelError } = await supabase
      .from('models')
      .update({
        title: title || 'Untitled Model',
        description: description || 'AI-generated 3D model',
        updated_at: new Date().toISOString(),
      })
      .eq('id', modelId)
      .eq('user_id', userId) // Ensure user owns this model
      .select()
      .single()

    if (modelError) {
      console.error('Database error:', modelError)
      return NextResponse.json(
        { error: 'Failed to save model' },
        { status: 500 }
      )
    }

    if (!modelData) {
      return NextResponse.json(
        { error: 'Model not found or you do not have permission to edit it' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      model: modelData,
    })

  } catch (error) {
    console.error('Save model error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}