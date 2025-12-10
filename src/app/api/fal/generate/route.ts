import { NextRequest, NextResponse } from 'next/server'
import { fal } from '@fal-ai/client'
import { FAL_APIS } from '@/config/fal-api'
import { PointsService } from '@/lib/points-service'
import { supabase } from '@/lib/supabase'

// 检查环境变量
console.log('FAL_KEY status:', process.env.FAL_KEY ? 'Set' : 'Not set')
console.log('FAL_KEY length:', process.env.FAL_KEY?.length || 0)

// 配置FAL客户端
fal.config({
  credentials: process.env.FAL_KEY,
})

async function generateImage(data: any) {
  const { model_id, prompt, image_url, ...otherParams } = data

  try {
    let result

    // 构建输入参数
    const inputParams: any = {
      prompt,
      ...otherParams
    }

    // 如果是图像编辑，添加image_url
    if (image_url) {
      inputParams.image_url = image_url
    }

    console.log('Running image generation with params:', inputParams)

    switch (model_id) {
      case 'fal-ai/nano-banana-pro':
        // 文本转图像
        result = await fal.run(model_id, {
          input: inputParams
        })
        break

      case 'fal-ai/nano-banana-pro/edit':
        // 图像编辑
        if (!image_url) {
          throw new Error('图像编辑需要提供image_url参数')
        }
        result = await fal.run(model_id, {
          input: inputParams
        })
        break

      default:
        throw new Error(`不支持的图像模型: ${model_id}`)
    }

    console.log('Image generation result:', result)

    return {
      success: true,
      images: (result as any).images || (result as any).data || [result],
      model: model_id,
      metadata: result
    }

  } catch (error) {
    console.error('图像生成失败:', error)
    throw error
  }
}

async function generate3D(data: any) {
  const {
    model_id,
    prompt,
    image_url,
    seed,
    sync_mode,
    scale,
    num_samples,
    output_format
  } = data

  try {
    console.log('Starting 3D generation with:', {
      model_id,
      prompt: prompt?.substring(0, 100),
      hasImage: !!image_url,
      seed,
      sync_mode,
      scale,
      num_samples,
      output_format
    })

    // 获取模型配置以确定支持的参数
    const modelConfig = FAL_APIS[model_id as keyof typeof FAL_APIS]
    if (!modelConfig) {
      throw new Error(`不支持的模型: ${model_id}`)
    }

    // 构建输入参数，只包含模型支持的参数
    const inputParams: any = {
      prompt: prompt || 'a 3D model'
    }

    // 只添加Trellis实际支持的参数
    if (image_url) inputParams.image_url = image_url
    if (seed !== null && seed !== undefined) inputParams.seed = seed
    if (sync_mode !== undefined) inputParams.sync_mode = sync_mode
    if (scale !== undefined) inputParams.scale = scale
    if (num_samples !== undefined) inputParams.num_samples = num_samples
    if (output_format) inputParams.output_format = output_format

    console.log('Final input parameters for FAL API:', inputParams)

    // 使用正确的FAL-AI客户端API - 使用run方法而不是submit
    const result = await fal.run(model_id, {
      input: inputParams
    })

    console.log('3D generation result:', result)

    // 根据FAL-AI的实际响应格式提取模型URL
    console.log('Full result structure:', JSON.stringify(result, null, 2))

    // 检查所有可能的模型URL路径 - 修正路径结构
    const possiblePaths = [
      (result as any).data?.model_mesh?.url,    // Trellis 3D模型正确路径
      (result as any).model_mesh?.url,
      (result as any).data?.[0]?.url,
      (result as any).data?.model_url,
      (result as any).output?.[0]?.url,        // 添加数组输出支持
      (result as any).output?.url,
      (result as any).model_url,
      (result as any).url,
      (result as any).data?.url
    ]

    console.log('Possible paths:', possiblePaths)

    const modelUrl = possiblePaths.find(path => path && typeof path === 'string')

    if (!modelUrl) {
      console.error('No model URL found in result. Full structure:', result)
      console.error('Specifically checking result.data.model_mesh.url:', (result as any).data?.model_mesh?.url)
      // 如果有data但路径不匹配，尝试返回第一个可能的URL
      if ((result as any).data && typeof (result as any).data === 'object') {
        console.log('Found data object, searching for any URL...')
        const searchForUrl = (obj: any): string | null => {
          if (typeof obj === 'string' && obj.startsWith('https')) {
            return obj
          }
          if (typeof obj === 'object' && obj !== null) {
            for (const [key, value] of Object.entries(obj)) {
              const result = searchForUrl(value)
              if (result) return result
            }
          }
          return null
        }
        const foundUrl = searchForUrl((result as any).data)
        if (foundUrl) {
          console.log('Found URL by deep search:', foundUrl)
          return {
            success: true,
            model_url: foundUrl,
            model: model_id,
            metadata: result
          }
        }
      }
      throw new Error(`生成成功但未获取到模型URL。检查路径: data.model_mesh.url = ${(result as any).data?.model_mesh?.url}`)
    }

    console.log('Extracted model URL:', modelUrl)

    return {
      success: true,
      model_url: modelUrl,
      model: model_id,
      metadata: result
    }

  } catch (error) {
    console.error('3D生成失败:', error)

    // 提取更详细的错误信息
    let errorMessage = error instanceof Error ? error.message : '未知错误'
    if (error instanceof Error && 'body' in error) {
      const errorBody = (error as any).body
      if (errorBody && typeof errorBody === 'object') {
        errorMessage += ` - ${JSON.stringify(errorBody)}`
      }
    }

    throw new Error(errorMessage)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, data, userId } = await request.json()

    console.log('API Request received:', { type, data, userId })

    if (!type || !data || !userId) {
      return NextResponse.json(
        { error: '缺少必要参数: type, data 和 userId' },
        { status: 400 }
      )
    }

    console.log('Validating user:', userId)

    // 验证用户身份
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    console.log('User validation result:', { userData, userError: userError?.message })

    if (userError || !userData) {
      console.error('User validation failed:', {
        userId,
        userError: userError?.message,
        userData
      })
      return NextResponse.json(
        {
          error: '用户验证失败',
          details: userError?.message || '用户不存在',
          userId: userId
        },
        { status: 401 }
      )
    }

    // 确定生成类型和成本
    let generationType: string
    switch (data.model_id) {
      case 'fal-ai/nano-banana-pro':
        generationType = 'text-to-image'
        break
      case 'fal-ai/nano-banana-pro/edit':
        generationType = 'image-edit'
        break
      case 'fal-ai/trellis':
        generationType = data.image_url ? 'image-to-3d' : 'text-to-3d'
        break
      default:
        return NextResponse.json(
          { error: `不支持的模型: ${data.model_id}` },
          { status: 400 }
        )
    }

    const cost = PointsService.getGenerationCost(generationType)

    // 检查用户积分
    if (userData.points < cost) {
      return NextResponse.json(
        {
          error: '积分不足',
          required: cost,
          available: userData.points,
          message: `需要 ${cost} 积分，当前只有 ${userData.points} 积分`
        },
        { status: 402 }
      )
    }

    // 创建生成记录并扣除积分
    let generation
    try {
      const result = await PointsService.createGeneration(userId, {
        title: `${generationType} generation`,
        description: data.prompt?.substring(0, 100),
        model_type: type === '3d' ? '3d' : 'image',
        generation_type: generationType as any,
        model_id: data.model_id,
        parameters: data
      })
      generation = result.generation
    } catch (pointsError) {
      console.error('Points deduction failed:', pointsError)
      return NextResponse.json(
        { error: '积分扣除失败，请稍后重试' },
        { status: 500 }
      )
    }

    console.log('Generation created, ID:', generation.id, 'Points deducted:', cost)

    let apiResult

    try {
      // 调用FAL API
      switch (type) {
        case 'image':
          apiResult = await generateImage(data)
          break
        case '3d':
          apiResult = await generate3D(data)
          break
        default:
          throw new Error(`不支持的生成类型: ${type}`)
      }

      console.log('API Success, updating generation record')

      // 更新生成记录为成功
      await PointsService.completeGeneration(generation.id, {
        model_url: (apiResult as any).model_url,
        image_url: (apiResult as any).images?.[0],
        status: 'completed'
      })

      return NextResponse.json({
        success: true,
        data: apiResult,
        generation: {
          id: generation.id,
          points_cost: cost,
          remaining_points: userData.points - cost
        }
      })

    } catch (apiError) {
      console.error('FAL API调用失败:', apiError)

      // 退还积分
      try {
        await PointsService.refundPoints(userId, generation.id, cost)
        console.log('Points refunded:', cost)
      } catch (refundError) {
        console.error('积分退还失败:', refundError)
      }

      return NextResponse.json(
        {
          error: apiError instanceof Error ? apiError.message : '生成失败',
          details: apiError,
          points_refunded: cost,
          message: '生成失败，积分已退还'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('API调用失败:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '生成失败',
        details: error
      },
      { status: 500 }
    )
  }
}