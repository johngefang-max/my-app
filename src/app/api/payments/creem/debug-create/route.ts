import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG: Payment API called ===')

    const body = await request.text()
    console.log('Request body:', body)

    let parsedBody
    try {
      parsedBody = JSON.parse(body)
    } catch (e) {
      console.error('JSON parse error:', e)
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { planId } = parsedBody
    console.log('Extracted planId:', planId)

    if (!planId) {
      console.error('Missing planId')
      return NextResponse.json(
        { error: 'Missing planId', debug: { receivedBody: parsedBody } },
        { status: 400 }
      )
    }

    // Get token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
    })

    console.log('Token:', token ? 'found' : 'not found')
    if (!token?.email) {
      console.error('No token email found')
      return NextResponse.json(
        { error: 'User not authenticated', debug: { token: token ? 'exists' : 'missing' } },
        { status: 401 }
      )
    }

    console.log('User email:', token.email)

    // Check environment variables
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'missing',
      CREEM_API_KEY: process.env.CREEM_API_KEY ? 'set' : 'missing',
      CREEM_PRODUCT_ID: process.env.CREEM_PRODUCT_ID ? 'set' : 'missing'
    }

    console.log('Environment variables:', envVars)

    // Check Supabase connection
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.my_app_SUPABASE_URL || process.env.NEXT_PUBLIC_my_app_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.my_app_SUPABASE_SERVICE_ROLE_KEY || ''
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY || process.env.my_app_SUPABASE_ANON_KEY || ''

    console.log('Supabase config:', { baseUrl: baseUrl ? 'set' : 'missing', serviceKey: serviceKey ? 'set' : 'missing', anonKey: anonKey ? 'set' : 'missing' })

    if (!baseUrl || !anonKey) {
      console.error('Missing Supabase configuration')
      return NextResponse.json(
        {
          error: 'Server configuration error',
          debug: {
            baseUrl: baseUrl ? 'set' : 'missing',
            anonKey: anonKey ? 'set' : 'missing',
            serviceKey: serviceKey ? 'set' : 'missing'
          }
        },
        { status: 500 }
      )
    }

    const bearer = serviceKey || anonKey

    // Test user lookup
    console.log('Testing user lookup...')
    const userRes = await fetch(`${baseUrl}/rest/v1/users?email=eq.${encodeURIComponent(token.email)}&select=*`, {
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey
      }
    })

    console.log('User lookup response status:', userRes.status)
    const users = await userRes.json()
    console.log('User lookup response data:', users)
    const user = Array.isArray(users) && users.length > 0 ? users[0] : null

    if (!user) {
      console.error('User not found:', token.email)
      return NextResponse.json(
        {
          error: 'User not found in database',
          debug: { email: token.email, userCount: users.length }
        },
        { status: 404 }
      )
    }

    console.log('Found user:', { id: user.id, email: user.email })

    // Test Creem service
    try {
      const { createCheckout } = await import('@/services/creem')
      console.log('Creem service imported successfully')

      // Don't actually create payment, just test import
      return NextResponse.json({
        success: true,
        debug: {
          user: { id: user.id, email: user.email },
          planId,
          envVars,
          message: 'Debug endpoint - payment not created'
        }
      })
    } catch (importError) {
      console.error('Creem import error:', importError)
      return NextResponse.json(
        {
          error: 'Creem service import failed',
          debug: { error: importError instanceof Error ? importError.message : String(importError) }
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('=== DEBUG: Unhandled error ===', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        debug: {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        }
      },
      { status: 500 }
    )
  }
}