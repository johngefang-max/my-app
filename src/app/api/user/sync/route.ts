import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { PointsService } from '@/lib/points-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, avatar_url } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    console.log('Creating/syncing user for email:', email)

    // Try to find existing user
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (findError && findError.code !== 'PGRST116') {
      console.error('Error finding user:', findError)
      return NextResponse.json(
        { error: 'Database error', details: findError.message },
        { status: 500 }
      )
    }

    if (existingUser) {
      console.log('User already exists:', existingUser.id)
      return NextResponse.json({
        success: true,
        user: existingUser,
        message: 'User already exists'
      })
    }

    // Create new user
    console.log('Creating new user for email:', email)

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email: email,
        username: name || email.split('@')[0],
        avatar_url: avatar_url || null,
        plan: 'free',
        points: 0,
        total_points_earned: 0,
        total_points_spent: 0,
        usage_count: 0,
        storage_used_bytes: 0,
        max_storage_bytes: 104857600 // 100MB
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating user:', createError)
      return NextResponse.json(
        { error: 'Failed to create user', details: createError.message },
        { status: 500 }
      )
    }

    console.log('New user created successfully:', newUser.id)

    // Award signup bonus points
    try {
      await PointsService.awardSignupBonus(newUser.id)
      console.log('Signup bonus points awarded to user:', newUser.id)
    } catch (bonusError) {
      console.error('Error awarding signup bonus:', bonusError)
      // Don't fail the request if bonus awarding fails
    }

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'User created successfully'
    })

  } catch (error) {
    console.error('User creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    console.log('Looking up user by email:', email)

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          message: 'User not found',
          email: email
        })
      }

      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: user,
      message: 'User found'
    })

  } catch (error) {
    console.error('User lookup error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}