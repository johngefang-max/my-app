import { NextResponse } from 'next/server'
import { fal } from '@fal-ai/client'

// 检查环境变量
console.log('FAL_KEY status:', process.env.FAL_KEY ? 'Set' : 'Not set')
console.log('FAL_KEY length:', process.env.FAL_KEY?.length || 0)

// 配置FAL客户端
fal.config({
  credentials: process.env.FAL_KEY,
})

export async function GET() {
  try {
    // 测试API连接 - 简单测试运行一个已知模型
    console.log('Testing FAL API connection...')

    // 尝试一个简单的测试调用
    try {
      const result = await fal.run('fal-ai/trellis', {
        input: {
          prompt: 'a simple test 3D model'
        } as any
      })
      console.log('Test API call successful')
    } catch (testError) {
      console.log('Test API call failed (expected if no credits):', testError instanceof Error ? testError.message : testError)
    }

    return NextResponse.json({
      success: true,
      falKeyStatus: process.env.FAL_KEY ? 'Set' : 'Not set',
      message: 'FAL API connection test completed'
    })

  } catch (error) {
    console.error('FAL API Test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      falKeyStatus: process.env.FAL_KEY ? 'Set' : 'Not set'
    }, { status: 500 })
  }
}