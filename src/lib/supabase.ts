import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'x-application-name': '3d-model-preview',
    },
  },
})

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          password_hash: string | null
          avatar_url: string | null
          plan: 'free' | 'premium' | 'enterprise'
          usage_count: number
          storage_used_bytes: number
          max_storage_bytes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          password_hash?: string | null
          avatar_url?: string | null
          plan?: 'free' | 'premium' | 'enterprise'
          usage_count?: number
          storage_used_bytes?: number
          max_storage_bytes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          password_hash?: string | null
          avatar_url?: string | null
          plan?: 'free' | 'premium' | 'enterprise'
          usage_count?: number
          storage_used_bytes?: number
          max_storage_bytes?: number
          created_at?: string
          updated_at?: string
        }
      }
      models: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          tags: string[] | null
          is_public: boolean
          view_count: number
          like_count: number
          download_count: number
          processing_status: 'pending' | 'processing' | 'completed' | 'failed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          tags?: string[] | null
          is_public?: boolean
          view_count?: number
          like_count?: number
          download_count?: number
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          tags?: string[] | null
          is_public?: boolean
          view_count?: number
          like_count?: number
          download_count?: number
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          created_at?: string
          updated_at?: string
        }
      }
      model_files: {
        Row: {
          id: string
          model_id: string
          file_url: string
          thumbnail_url: string | null
          format: 'glb' | 'gltf' | 'obj' | 'fbx' | 'stl'
          vertex_count: number | null
          face_count: number | null
          size_bytes: number
          storage_path: string
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          model_id: string
          file_url: string
          thumbnail_url?: string | null
          format: 'glb' | 'gltf' | 'obj' | 'fbx' | 'stl'
          vertex_count?: number | null
          face_count?: number | null
          size_bytes: number
          storage_path: string
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          model_id?: string
          file_url?: string
          thumbnail_url?: string | null
          format?: 'glb' | 'gltf' | 'obj' | 'fbx' | 'stl'
          vertex_count?: number | null
          face_count?: number | null
          size_bytes?: number
          storage_path?: string
          is_primary?: boolean
          created_at?: string
        }
      }
      model_views: {
        Row: {
          id: string
          model_id: string
          user_id: string | null
          ip_address: string | null
          viewed_at: string
          metadata: any | null
        }
        Insert: {
          id?: string
          model_id: string
          user_id?: string | null
          ip_address?: string | null
          viewed_at?: string
          metadata?: any | null
        }
        Update: {
          id?: string
          model_id?: string
          user_id?: string | null
          ip_address?: string | null
          viewed_at?: string
          metadata?: any | null
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: string
          amount: number
          currency: string
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          metadata: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          amount: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          metadata?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          amount?: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          metadata?: any | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Tables = Database['public']['Tables']
export type User = Tables['users']['Row']
export type Model = Tables['models']['Row']
export type ModelFile = Tables['model_files']['Row']
export type ModelView = Tables['model_views']['Row']
export type Transaction = Tables['transactions']['Row']