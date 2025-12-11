import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    console.log('User verification request for userId:', userId)

    // If no userId provided, get current user from session
    if (!userId) {
      return NextResponse.json({
        error: 'Missing userId parameter',
        usage: 'GET /api/debug/user?userId=USER_ID'
      }, { status: 400 })
    }

    // Try to find user by ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Database error:', userError)
      return NextResponse.json({
        error: 'Database error',
        details: userError,
        userId: userId
      }, { status: 500 })
    }

    if (!user) {
      console.log('User not found:', userId)

      // Check if there are any users at all
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('id, email, username, plan, subscription_status')
        .limit(10)

      return NextResponse.json({
        error: 'User not found',
        userId: userId,
        allUsers: allUsers || [],
        allUsersError: allUsersError
      }, { status: 404 })
    }

    // Return user data
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        plan: user.plan,
        subscription_status: user.subscription_status,
        points: user.points,
        created_at: user.created_at
      }
    })

  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}