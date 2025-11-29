import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, url, type = 'uploaded', description, tags = [], is_public = false } = body

    if (!title || !url) {
      return NextResponse.json(
        { error: '标题和URL是必需的' },
        { status: 400 }
      )
    }

    // 这里应该验证用户的认证状态
    // 暂时使用测试用户ID，实际应用中应该从session中获取
    const testUserId = '7a383601-4bfb-43fa-85ab-3c0368b125ea'

    // 创建模型记录
    const { data: model, error } = await supabase
      .from('models')
      .insert({
        title,
        description,
        tags,
        user_id: testUserId,
        is_public,
        processing_status: 'completed'
      })
      .select()
      .single()

    if (error) {
      console.error('创建模型记录失败:', error)
      return NextResponse.json(
        { error: '保存模型失败' },
        { status: 500 }
      )
    }

    // 如果有文件URL，创建文件记录
    if (url) {
      const fileExtension = url.split('.').pop()?.toLowerCase() || 'glb'
      const fileSize = 1024000 // 假设1MB，实际应该获取真实文件大小

      const { error: fileError } = await supabase
        .from('model_files')
        .insert({
          model_id: model.id,
          file_url: url,
          format: fileExtension as any,
          size_bytes: fileSize,
          storage_path: `/models/${model.id}/model.${fileExtension}`,
          is_primary: true
        })

      if (fileError) {
        console.error('创建文件记录失败:', fileError)
        return NextResponse.json(
          { error: '保存文件失败' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: '模型保存成功',
      model
    })

  } catch (error) {
    console.error('保存模型时出错:', error)
    return NextResponse.json(
      { error: '保存失败' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const isPublic = searchParams.get('public')

    let query = supabase
      .from('models')
      .select(`
        *,
        model_files (
          id,
          file_url,
          format,
          size_bytes,
          is_primary
        )
      `)
      .order('created_at', { ascending: false })

    // 根据参数过滤
    if (isPublic === 'true') {
      query = query.eq('is_public', true)
    } else if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: models, error } = await query

    if (error) {
      console.error('获取模型列表失败:', error)
      return NextResponse.json(
        { error: '获取模型失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      models: models || []
    })

  } catch (error) {
    console.error('获取模型时出错:', error)
    return NextResponse.json(
      { error: '获取失败' },
      { status: 500 }
    )
  }
}