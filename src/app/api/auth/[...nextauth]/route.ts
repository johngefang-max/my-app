import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const handler = NextAuth({
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  events: {
    async signIn({ user, account }) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
        const serviceKey = process.env.my_app_SUPABASE_SERVICE_ROLE_KEY as string
        const anonKey = process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY as string
        if (!baseUrl || !serviceKey || !anonKey) return
        const providerSub = account?.providerAccountId || ''
        const body = [{
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          avatar_url: user.image ?? undefined,
          provider_sub: providerSub,
        }]
        await fetch(`${baseUrl}/rest/v1/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': anonKey,
            'Prefer': 'resolution=merge-duplicates',
          },
          body: JSON.stringify(body)
        })
      } catch {}
    }
  }
})

export { handler as GET, handler as POST }
