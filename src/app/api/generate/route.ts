import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { prompt, style, quality, format } = await request.json()
    
    // Validate input
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Get Fal.ai API key from environment
    const falApiKey = process.env.FAL_KEY || '42b8cb66-d35e-451a-b039-67a52a101810:99ae2ab1190a2a3d88177218a1c96af8'
    if (!falApiKey) {
      return NextResponse.json(
        { error: 'Fal.ai API key not configured' },
        { status: 500 }
      )
    }

    // Call Fal.ai API for 3D model generation
    const response = await fetch('https://api.fal.ai/v1/models/fal-ai/3d-model-generator', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        style: style || 'realistic',
        quality: quality || 'high',
        format: format || 'glb',
        guidance_scale: 7.5,
        num_inference_steps: 50,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      return NextResponse.json(
        { error: `Fal.ai API error: ${errorData.error || response.statusText}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    
    // Extract the generated model URL
    const modelUrl = result.model_url || result.url || result.image?.url
    
    if (!modelUrl) {
      return NextResponse.json(
        { error: 'No model URL returned from Fal.ai' },
        { status: 500 }
      )
    }

    // Get user ID from session (you'll need to implement proper auth)
    const authHeader = request.headers.get('authorization')
    let userId = null
    
    if (authHeader) {
      // Extract user ID from JWT or session
      // This is a simplified version - implement proper JWT verification
      userId = 'demo-user-id' // Replace with actual user ID extraction
    }

    // Create model record in database
    const { data: modelData, error: modelError } = await supabase
      .from('models')
      .insert([
        {
          title: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
          description: `AI-generated 3D model from prompt: "${prompt}"`,
          tags: [style || 'realistic', quality || 'high', format || 'glb'],
          user_id: userId,
          is_public: true,
          view_count: 0,
          like_count: 0,
          download_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single()

    if (modelError) {
      console.error('Database error:', modelError)
      return NextResponse.json(
        { error: 'Failed to save model to database' },
        { status: 500 }
      )
    }

    // Create model file record
    const { data: fileData, error: fileError } = await supabase
      .from('model_files')
      .insert([
        {
          model_id: modelData.id,
          file_name: `${modelData.id}.${format || 'glb'}`,
          file_url: modelUrl,
          file_size: 0, // Fal.ai doesn't provide file size
          file_format: format || 'glb',
          is_primary: true,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single()

    if (fileError) {
      console.error('File database error:', fileError)
      // Don't fail the request if file record creation fails
    }

    return NextResponse.json({
      success: true,
      modelId: modelData.id,
      modelUrl,
      modelData,
      fileData,
    })

  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}