import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 使用Service Role Key创建管理员客户端
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.my_app_SUPABASE_URL!,
  process.env.my_app_SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// 测试用户数据
const testUser = {
  email: 'test@example.com',
  username: 'testuser',
  plan: 'free' as const,
  usage_count: 0,
  storage_used_bytes: 0,
  max_storage_bytes: 104857600
}

// 测试模型数据
const testModel = {
  title: '测试3D模型',
  description: '这是一个用于测试的3D模型',
  tags: ['测试', '3D模型'],
  is_public: true,
  view_count: 0,
  like_count: 0,
  download_count: 0,
  processing_status: 'completed' as const
}

// 测试模型文件数据
const testModelFile = {
  file_url: 'https://example.com/test-model.glb',
  thumbnail_url: 'https://example.com/test-thumbnail.jpg',
  format: 'glb' as const,
  vertex_count: 1000,
  face_count: 500,
  size_bytes: 1024000,
  storage_path: '/test-models/test-model.glb',
  is_primary: true
}

export async function GET() {
  try {
    console.log('开始管理员权限CRUD操作测试...')

    const results = {
      success: true,
      operations: {} as Record<string, any>,
      errors: [] as string[]
    }

    // 1. 测试用户表 - CREATE
    try {
      console.log('测试用户创建...')
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert(testUser)
        .select()
        .single()

      if (createError) {
        // 如果用户已存在，尝试获取现有用户
        if (createError.code === '23505') {
          const { data: existingUser, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', testUser.email)
            .single()

          if (fetchError) {
            throw fetchError
          }
          results.operations.createUser = existingUser
          console.log('使用现有测试用户:', existingUser)
        } else {
          throw createError
        }
      } else {
        results.operations.createUser = newUser
        console.log('创建测试用户成功:', newUser)
      }

      // 2. 测试用户表 - READ
      console.log('测试用户读取...')
      const { data: readUser, error: readError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', testUser.email)
        .single()

      if (readError) throw readError
      results.operations.readUser = readUser
      console.log('读取用户成功:', readUser)

      const userId = readUser.id

      // 3. 测试模型表 - CREATE
      console.log('测试模型创建...')
      const { data: newModel, error: modelError } = await supabaseAdmin
        .from('models')
        .insert({ ...testModel, user_id: userId })
        .select()
        .single()

      if (modelError) {
        // 如果模型已存在，尝试获取现有模型
        if (modelError.code === '23505') {
          const { data: existingModel, error: fetchModelError } = await supabaseAdmin
            .from('models')
            .select('*')
            .eq('title', testModel.title)
            .eq('user_id', userId)
            .single()

          if (fetchModelError) throw fetchModelError
          results.operations.createModel = existingModel
          console.log('使用现有测试模型:', existingModel)
        } else {
          throw modelError
        }
      } else {
        results.operations.createModel = newModel
        console.log('创建测试模型成功:', newModel)
      }

      // 4. 测试模型表 - READ
      console.log('测试模型读取...')
      const { data: readModel, error: readModelError } = await supabaseAdmin
        .from('models')
        .select('*')
        .eq('user_id', userId)
        .eq('title', testModel.title)
        .single()

      if (readModelError) throw readModelError
      results.operations.readModel = readModel
      console.log('读取模型成功:', readModel)

      const modelId = readModel.id

      // 5. 测试模型文件表 - CREATE
      console.log('测试模型文件创建...')
      const { data: newModelFile, error: fileError } = await supabaseAdmin
        .from('model_files')
        .insert({ ...testModelFile, model_id: modelId })
        .select()
        .single()

      if (fileError) {
        // 如果文件已存在，获取现有文件
        if (fileError.code === '23505') {
          const { data: existingFile, error: fetchFileError } = await supabaseAdmin
            .from('model_files')
            .select('*')
            .eq('model_id', modelId)
            .eq('storage_path', testModelFile.storage_path)
            .single()

          if (fetchFileError) throw fetchFileError
          results.operations.createModelFile = existingFile
          console.log('使用现有测试文件:', existingFile)
        } else {
          throw fileError
        }
      } else {
        results.operations.createModelFile = newModelFile
        console.log('创建测试文件成功:', newModelFile)
      }

      // 6. 测试模型文件表 - READ
      console.log('测试模型文件读取...')
      const { data: readFile, error: readFileError } = await supabaseAdmin
        .from('model_files')
        .select('*')
        .eq('model_id', modelId)
        .single()

      if (readFileError) throw readFileError
      results.operations.readModelFile = readFile
      console.log('读取文件成功:', readFile)

      // 7. 测试模型浏览记录 - CREATE
      console.log('测试浏览记录创建...')
      const { data: newView, error: viewError } = await supabaseAdmin
        .from('model_views')
        .insert({
          model_id: modelId,
          user_id: userId,
          ip_address: '127.0.0.1',
          metadata: { test: true, source: 'admin_crud_test' }
        })
        .select()
        .single()

      if (viewError) throw viewError
      results.operations.createModelView = newView
      console.log('创建浏览记录成功:', newView)

      // 8. 测试交易记录 - CREATE
      console.log('测试交易记录创建...')
      const { data: newTransaction, error: transactionError } = await supabaseAdmin
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'test_payment',
          amount: 9.99,
          currency: 'USD',
          status: 'completed',
          metadata: { test: true, source: 'admin_crud_test' }
        })
        .select()
        .single()

      if (transactionError) throw transactionError
      results.operations.createTransaction = newTransaction
      console.log('创建交易记录成功:', newTransaction)

      // 9. 测试UPDATE操作
      console.log('测试用户更新...')
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          usage_count: readUser.usage_count + 1,
          plan: 'premium'
        })
        .eq('id', userId)
        .select()
        .single()

      if (updateError) throw updateError
      results.operations.updateUser = updatedUser
      console.log('更新用户成功:', updatedUser)

      // 10. 测试关联查询
      console.log('测试关联查询...')
      const { data: userWithModels, error: joinError } = await supabaseAdmin
        .from('users')
        .select(`
          *,
          models (*),
          transactions (*)
        `)
        .eq('id', userId)
        .single()

      if (joinError) throw joinError
      results.operations.userWithModels = userWithModels
      console.log('关联查询成功:', userWithModels)

      console.log('管理员权限CRUD操作测试完成！')

      return NextResponse.json({
        success: true,
        message: '所有CRUD操作测试成功！数据库功能正常',
        results,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('CRUD测试失败:', error)
      results.success = false
      results.errors.push(error instanceof Error ? error.message : 'Unknown error')

      return NextResponse.json({
        success: false,
        message: 'CRUD操作测试失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        results,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

  } catch (error) {
    console.error('测试执行失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '测试执行失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// POST方法用于执行特定的清理操作
export async function POST() {
  try {
    console.log('开始清理测试数据...')

    // 删除所有测试相关数据
    const { error: deleteViewsError } = await supabaseAdmin
      .from('model_views')
      .delete()
      .or('metadata->>test.eq.true')

    const { error: deleteTransactionsError } = await supabaseAdmin
      .from('transactions')
      .delete()
      .or('metadata->>test.eq.true')

    const { error: deleteFilesError } = await supabaseAdmin
      .from('model_files')
      .delete()
      .or('storage_path.ilike.%test%')

    const { error: deleteModelsError } = await supabaseAdmin
      .from('models')
      .delete()
      .or('title.ilike.%测试%')

    const { error: deleteUsersError } = await supabaseAdmin
      .from('users')
      .delete()
      .or('email.ilike.%test%')

    const errors = []
    if (deleteViewsError) errors.push(`删除浏览记录失败: ${deleteViewsError.message}`)
    if (deleteTransactionsError) errors.push(`删除交易记录失败: ${deleteTransactionsError.message}`)
    if (deleteFilesError) errors.push(`删除文件失败: ${deleteFilesError.message}`)
    if (deleteModelsError) errors.push(`删除模型失败: ${deleteModelsError.message}`)
    if (deleteUsersError) errors.push(`删除用户失败: ${deleteUsersError.message}`)

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        message: '部分清理操作失败',
        errors,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '所有测试数据清理成功',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('清理操作失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '清理操作失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}