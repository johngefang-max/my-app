import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const handler = NextAuth({
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  events: {
    async signIn({ user, account }) {
      try {
        const baseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.my_app_SUPABASE_URL || process.env.NEXT_PUBLIC_my_app_SUPABASE_URL) as string
        const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.my_app_SUPABASE_SERVICE_ROLE_KEY || '') as string
        const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY || process.env.my_app_SUPABASE_ANON_KEY || '') as string
        if (!baseUrl || !anonKey || !user?.email) return
        const bearer = serviceKey || anonKey
        const baseName = (user.name || (user.email || '').split('@')[0] || '').toLowerCase().replace(/[^a-z0-9\-_.]/g, '-')
        let username = baseName || `user-${Math.random().toString(36).slice(2,8)}`
        // ensure unique username
        for (let i = 0; i < 2; i++) {
          const checkRes = await fetch(`${baseUrl}/rest/v1/users?username=eq.${encodeURIComponent(username)}&select=id&limit=1`, {
            headers: { 'Authorization': `Bearer ${bearer}`, 'apikey': anonKey }
          })
          const exists = await checkRes.json().catch(() => [])
          if (Array.isArray(exists) && exists.length > 0) {
            username = `${baseName || 'user'}-${Math.random().toString(36).slice(2,8)}`
          } else {
            break
          }
        }
        const upsertBody = [{
          email: user.email ?? undefined,
          username,
          avatar_url: user.image ?? undefined,
          plan: 'free',
          usage_count: 0,
          storage_used_bytes: 0,
          max_storage_bytes: 1073741824,
        }]
        const upsertRes = await fetch(`${baseUrl}/rest/v1/users?on_conflict=email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearer}`,
            'apikey': anonKey,
            'Prefer': 'resolution=merge-duplicates,return=representation',
          },
          body: JSON.stringify(upsertBody)
        })
        const rep = await upsertRes.json().catch(() => null)
        const userId = Array.isArray(rep) && rep[0]?.id ? rep[0].id : undefined
        if (userId) {
          const mCheck = await fetch(`${baseUrl}/rest/v1/models?user_id=eq.${encodeURIComponent(userId)}&select=id&limit=1`, {
            headers: { 'Authorization': `Bearer ${bearer}`, 'apikey': anonKey }
          })
          const m = await mCheck.json().catch(() => [])
          if (!Array.isArray(m) || m.length === 0) {
            await fetch(`${baseUrl}/rest/v1/models`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${bearer}`,
                'apikey': anonKey,
                'Prefer': 'return=representation'
              },
              body: JSON.stringify([{ user_id: userId, title: '我的第一个模型', description: null, tags: [], is_public: true }])
            })
          }
        }
      } catch {}
    }
  }
})

export { handler as GET, handler as POST }
