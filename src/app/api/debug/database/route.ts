import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing database connection...')

    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('Database connection error:', testError)
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: testError.message
      }, { status: 500 })
    }

    // Test users table structure
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (usersError) {
      console.error('Users table query error:', usersError)
      return NextResponse.json({
        success: false,
        error: 'Users table query failed',
        details: usersError.message
      }, { status: 500 })
    }

    // Get table structure
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'users' })

    console.log('Table info:', tableInfo)

    // Get sample users
    const { data: sampleUsers, error: sampleError } = await supabase
      .from('users')
      .select('id, email, username, plan, points')
      .limit(5)

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      tableInfo: {
        tableName: 'users',
        hasRecords: usersData && usersData.length > 0,
        sampleUsers: sampleUsers || [],
        tableStructure: tableInfo || null
      },
      connection: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured' : 'Not configured',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configured' : 'Not configured'
      }
    })

  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}