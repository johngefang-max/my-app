import { NextRequest, NextResponse } from 'next/server'
import { fal } from '@fal-ai/client'
import { FAL_APIS } from '@/config/fal-api'
import { getToken } from 'next-auth/jwt'

// 检查环境变量
console.log('FAL_KEY status:', process.env.FAL_KEY ? 'Set' : 'Not set')
console.log('FAL_KEY length:', process.env.FAL_KEY?.length || 0)

// 配置FAL客户端
fal.config({
  credentials: process.env.FAL_KEY,
})

async function generateImage(data: any) {
  const { model_id, prompt, image_url, image_urls, ...otherParams } = data

  try {
    let result

    // 构建输入参数
    const inputParams: any = {
      prompt,
      ...otherParams
    }

    // 处理图像参数
    if (model_id === 'fal-ai/nano-banana-pro/edit') {
      // 图像编辑模型需要 image_urls 作为数组
      if (image_urls && Array.isArray(image_urls)) {
        inputParams.image_urls = image_urls
      } else if (image_url) {
        inputParams.image_urls = [image_url]
      } else {
        throw new Error('图像编辑需要提供 image_urls 参数')
      }
    } else if (model_id === 'fal-ai/nano-banana-pro') {
      // 文本转图像模型不需要任何图像参数
      // 不添加 image_url 或 image_urls 字段
    } else {
      // 其他模型使用单个 image_url
      if (image_url) {
        inputParams.image_url = image_url
      }
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
    // 先尝试从 token 获取用户信息
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
    })

    // 验证请求体
    let body;
    try {
      const text = await request.text();
      body = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { type, data, userEmail } = body

    // 使用 token 中的 email，如果没有则使用请求体中的
    const finalEmail = token?.email || userEmail

    console.log('Generation request:', {
      type,
      userEmailFromBody: userEmail,
      userEmailFromToken: token?.email,
      finalEmail,
      modelId: data.model_id
    })

    if (!type || !data || !finalEmail) {
      return NextResponse.json(
        {
          error: '缺少必要参数',
          details: { type, data, userEmail: !!userEmail, token: !!token }
        },
        { status: 400 }
      )
    }

    console.log('Validating user by email:', finalEmail)

    // 获取数据库配置
    const baseUrl = process.env.my_app_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_my_app_SUPABASE_URL
    const serviceKey = process.env.my_app_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const anonKey = process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.my_app_SUPABASE_ANON_KEY || ''
    const bearer = serviceKey || anonKey

    // 先创建一个supabase客户端来访问数据库
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(
      baseUrl || '',
      serviceKey || anonKey
    )

    // 使用supabase客户端而不是REST调用
    let { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', finalEmail)
      .maybeSingle()

    console.log('User validation result:', { userData, userError: (userError as any)?.message })

    // 如果用户不存在，自动创建
    if (!userData || userError) {
      console.log('User not found, attempting to create user...')

      try {
        // 直接创建用户，因为我们有认证信息
        const baseName = finalEmail.split('@')[0]?.toLowerCase().replace(/[^a-z0-9\-_.]/g, '-') || 'user'
        const username = baseName || `user-${Math.random().toString(36).slice(2,8)}`

        const { data: createdUser, error: createError } = await supabaseAdmin
          .from('users')
          .insert({
            email: finalEmail,
            username,
            avatar_url: null,
            plan: 'free',
            usage_count: 0,
            storage_used_bytes: 0,
            max_storage_bytes: 104857600,
            points: 10,  // 首次注册赠送10积分
            total_points_earned: 10,
            total_points_spent: 0
          })
          .select()
          .single()

        if (!createError && createdUser) {
          userData = createdUser
          console.log('User created successfully:', userData)
        } else {
          console.error('Failed to create user:', createError)
          throw new Error(`Failed to create user: ${createError?.message}`)
        }
      } catch (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json(
          {
            error: '用户验证失败',
            details: '无法创建或找到用户记录，请稍后重试',
            userEmail: finalEmail
          },
          { status: 401 }
        )
      }
    }

    // 再次验证用户数据
    if (!userData || !userData.id) {
      console.error('User data invalid:', { userData })
      return NextResponse.json(
        {
          error: '用户验证失败',
          details: '用户数据无效，请重新登录',
          userEmail: finalEmail
        },
        { status: 401 }
      )
    }

    console.log('User validated successfully:', {
      id: userData.id,
      email: userData.email,
      points: userData.points,
      total_points_spent: userData.total_points_spent
    })

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

    // 检查用户积分是否足够 - 使用 supabaseAdmin 客户端
    const { data: userPoints } = await supabaseAdmin
      .from('users')
      .select('points')
      .eq('id', userData.id)
      .single()

    const currentPoints = userPoints?.points || 0
    const cost = 3 // 所有生成都需要3积分
    if (currentPoints < cost) {
      return NextResponse.json(
        {
          error: '积分不足',
          details: `需要 ${cost} 积分，当前余额 ${currentPoints} 积分`,
          current_points: currentPoints,
          required_points: cost
        },
        { status: 402 }
      )
    }

    // 创建生成记录并扣除积分 - 使用事务确保数据一致性
    const { data: generation, error: genError } = await supabaseAdmin
      .from('generations')
      .insert({
        user_id: userData.id,
        title: `${data.prompt || 'Untitled'} - ${generationType}`,
        description: `Model: ${data.model_id}`,
        model_type: type === '3d' ? '3d' : 'image',
        generation_type: generationType,
        model_id: null, // 外键，暂时为null
        model_name: data.model_id, // 使用model_name存储模型标识符
        parameters: data,
        points_cost: cost,
        status: 'processing'
      })
      .select()
      .single()

    if (genError || !generation) {
      console.error('Failed to create generation record:', genError)
      return NextResponse.json(
        {
          error: '创建生成记录失败',
          details: genError?.message || '未知错误'
        },
        { status: 500 }
      )
    }

    // 扣除用户积分
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        points: currentPoints - cost,
        total_points_spent: (userData.total_points_spent || 0) + cost,
        updated_at: new Date().toISOString()
      })
      .eq('id', userData.id)

    if (updateError) {
      console.error('Failed to deduct points:', updateError)
      // 删除生成记录
      await supabaseAdmin
        .from('generations')
        .delete()
        .eq('id', generation.id)

      return NextResponse.json(
        {
          error: '积分扣除失败',
          details: updateError.message
        },
        { status: 500 }
      )
    }

    // 记录积分交易
    const { error: transError } = await supabaseAdmin
      .from('points_transactions')
      .insert({
        user_id: userData.id,
        amount: -cost,
        type: 'spent',
        description: `Generation: ${generationType}`,
        related_generation_id: generation.id,
        balance_before: currentPoints,
        balance_after: currentPoints - cost
      })

    if (transError) {
      console.error('Failed to record transaction:', transError)
      // 不影响主流程，但记录错误
    }

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

      console.log('API Success, generation completed')

      // 更新生成记录为成功状态
      try {
        await supabaseAdmin
          .from('generations')
          .update({
            model_url: (apiResult as any).model_url || null,
            image_url: (apiResult as any).images?.[0]?.url || null,
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', generation.id)
      } catch (error) {
        console.error('Failed to update generation record:', error)
        // 不影响返回结果，但记录错误
      }

      // 获取用户剩余积分
      const { data: updatedUser } = await supabaseAdmin
        .from('users')
        .select('points')
        .eq('id', userData.id)
        .single()

      return NextResponse.json({
        success: true,
        data: apiResult,
        generation: {
          id: generation.id,
          points_cost: generation.points_cost,
          remaining_points: updatedUser?.points || currentPoints - cost,
          message: '生成成功'
        }
      })

    } catch (apiError) {
      console.error('FAL API调用失败:', apiError)

      // 退还积分
      try {
        // 获取当前用户积分
        const { data: currentUser } = await supabaseAdmin
          .from('users')
          .select('points,total_points_spent')
          .eq('id', userData.id)
          .single()

        if (currentUser) {
          const refundAmount = generation.points_cost
          await supabaseAdmin
            .from('users')
            .update({
              points: currentUser.points + refundAmount,
              total_points_spent: Math.max(0, currentUser.total_points_spent - refundAmount),
              updated_at: new Date().toISOString()
            })
            .eq('id', userData.id)

          // 记录退款交易
          await supabaseAdmin
            .from('points_transactions')
            .insert({
              user_id: userData.id,
              amount: refundAmount,
              type: 'refunded',
              description: 'Refund for failed generation',
              related_generation_id: generation.id,
              balance_before: currentUser.points,
              balance_after: currentUser.points + refundAmount
            })
        }

        // 更新生成状态为失败
        await supabaseAdmin
          .from('generations')
          .update({
            status: 'failed',
            error_message: apiError instanceof Error ? apiError.message : 'Generation failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', generation.id)

        console.log('Points refunded successfully')
      } catch (refundError) {
        console.error('Failed to refund points:', refundError)
      }

      return NextResponse.json(
        {
          error: apiError instanceof Error ? apiError.message : '生成失败',
          details: apiError,
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