import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    step: 'start'
  }

  try {
    // 1. 获取请求体
    debugInfo.step = 'parsing_request'
    const { type, data, userEmail } = await request.json()
    debugInfo.requestData = { type, data: { ...data, image_url: data.image_url ? 'exists' : null }, userEmail }

    if (!type || !data || !userEmail) {
      debugInfo.error = 'Missing required parameters'
      return NextResponse.json({ debugInfo, error: '缺少必要参数' }, { status: 400 })
    }

    // 2. 检查环境变量
    debugInfo.step = 'checking_env'
    const envVars = {
      my_app_SUPABASE_URL: process.env.my_app_SUPABASE_URL ? 'set' : 'missing',
      my_app_SUPABASE_SERVICE_ROLE_KEY: process.env.my_app_SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'missing',
      NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY ? 'set' : 'missing',
      FAL_KEY: process.env.FAL_KEY ? 'set' : 'missing'
    }
    debugInfo.envVars = envVars

    // 3. 获取数据库配置
    debugInfo.step = 'getting_db_config'
    const baseUrl = process.env.my_app_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_my_app_SUPABASE_URL || ''
    const serviceKey = process.env.my_app_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const anonKey = process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.my_app_SUPABASE_ANON_KEY || ''
    const bearer = serviceKey || anonKey

    debugInfo.dbConfig = {
      baseUrl: baseUrl ? 'configured' : 'missing',
      serviceKey: serviceKey ? 'configured' : 'missing',
      anonKey: anonKey ? 'configured' : 'missing'
    }

    if (!baseUrl || !bearer) {
      debugInfo.error = 'Missing database configuration'
      return NextResponse.json({ debugInfo, error: '数据库配置缺失' }, { status: 500 })
    }

    // 4. 查找用户
    debugInfo.step = 'finding_user'
    const userResponse = await fetch(`${baseUrl}/rest/v1/users?email=eq.${encodeURIComponent(userEmail)}&select=*`, {
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey
      }
    })

    debugInfo.userLookupStatus = userResponse.status
    debugInfo.userLookupHeaders = Object.fromEntries(userResponse.headers.entries())

    if (!userResponse.ok) {
      debugInfo.error = `User lookup failed: ${userResponse.status} ${userResponse.statusText}`
      const errorText = await userResponse.text()
      debugInfo.errorText = errorText
      return NextResponse.json({ debugInfo, error: '用户查找失败' }, { status: 500 })
    }

    const users = await userResponse.json()
    const user = users && users.length > 0 ? users[0] : null
    debugInfo.userFound = !!user
    debugInfo.userData = user ? {
      id: user.id,
      email: user.email,
      points: user.points
    } : null

    if (!user) {
      debugInfo.error = 'User not found'
      return NextResponse.json({ debugInfo, error: '用户不存在' }, { status: 404 })
    }

    // 5. 检查积分
    debugInfo.step = 'checking_points'
    debugInfo.userPoints = user.points

    // 确定生成类型和成本
    const generationType = data.model_id === 'fal-ai/trellis'
      ? (data.image_url ? 'image-to-3d' : 'text-to-3d')
      : (data.model_id === 'fal-ai/nano-banana-pro/edit' ? 'image-edit' : 'text-to-image')

    debugInfo.generationType = generationType
    debugInfo.modelId = data.model_id

    // 使用硬编码的成本（3积分）
    const cost = 3
    debugInfo.generationCost = cost

    if (user.points < cost) {
      debugInfo.error = `Insufficient points: have ${user.points}, need ${cost}`
      return NextResponse.json({
        debugInfo,
        error: '积分不足',
        required: cost,
        available: user.points
      }, { status: 402 })
    }

    // 6. 测试创建 generation 记录
    debugInfo.step = 'creating_generation'
    const genData = {
      title: `Debug ${generationType}`,
      description: 'Debug generation',
      model_type: 'test',
      generation_type: generationType,
      model_id: data.model_id,
      user_id: user.id,
      points_cost: cost,
      status: 'processing'
    }

    const genResponse = await fetch(`${baseUrl}/rest/v1/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(genData)
    })

    debugInfo.genStatus = genResponse.status
    debugInfo.genHeaders = Object.fromEntries(genResponse.headers.entries())

    if (!genResponse.ok) {
      debugInfo.error = `Generation creation failed: ${genResponse.status}`
      const errorText = await genResponse.text()
      debugInfo.genErrorText = errorText
      return NextResponse.json({ debugInfo, error: '创建生成记录失败' }, { status: 500 })
    }

    const generations = await genResponse.json()
    const generation = generations[0]
    debugInfo.generationId = generation?.id

    // 7. 测试更新用户积分
    debugInfo.step = 'updating_points'
    const balanceBefore = user.points
    const balanceAfter = balanceBefore - cost

    const updateResponse = await fetch(`${baseUrl}/rest/v1/users?id=eq.${user.id}`, {
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

    debugInfo.updateStatus = updateResponse.status
    debugInfo.updateHeaders = Object.fromEntries(updateResponse.headers.entries())

    if (!updateResponse.ok) {
      debugInfo.error = `Points update failed: ${updateResponse.status}`
      const errorText = await updateResponse.text()
      debugInfo.updateErrorText = errorText

      // 清理生成记录
      await fetch(`${baseUrl}/rest/v1/generations?id=eq.${generation.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${bearer}`,
          'apikey': anonKey
        }
      })

      return NextResponse.json({ debugInfo, error: '积分更新失败' }, { status: 500 })
    }

    // 8. 测试创建积分交易记录
    debugInfo.step = 'creating_transaction'
    const transResponse = await fetch(`${baseUrl}/rest/v1/points_transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: user.id,
        amount: -cost,
        type: 'spent',
        description: `Test generation: ${generationType}`,
        related_generation_id: generation.id,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        created_at: new Date().toISOString()
      })
    })

    debugInfo.transStatus = transResponse.status
    debugInfo.transHeaders = Object.fromEntries(transResponse.headers.entries())

    if (!transResponse.ok) {
      debugInfo.error = `Transaction creation failed: ${transResponse.status}`
      const errorText = await transResponse.text()
      debugInfo.transErrorText = errorText
      // 不返回错误，因为积分已经扣除
      console.error('Failed to record transaction:', errorText)
    }

    debugInfo.step = 'success'
    debugInfo.finalBalance = balanceAfter

    // 9. 清理测试数据
    debugInfo.step = 'cleanup'
    await fetch(`${baseUrl}/rest/v1/generations?id=eq.${generation.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey
      }
    })

    // 恢复用户积分
    await fetch(`${baseUrl}/rest/v1/users?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey
      },
      body: JSON.stringify({
        points: balanceBefore
      })
    })

    debugInfo.cleanup = 'completed'

    return NextResponse.json({
      debugInfo,
      success: true,
      message: '积分系统调试完成，一切正常'
    })

  } catch (error) {
    debugInfo.step = 'error'
    debugInfo.error = error instanceof Error ? error.message : String(error)
    debugInfo.stack = error instanceof Error ? error.stack : undefined

    return NextResponse.json({
      debugInfo,
      error: '调试过程中发生错误'
    }, { status: 500 })
  }
}