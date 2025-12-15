import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (
  typeof window === 'undefined'
    ? (process.env.SUPABASE_URL
        || process.env.my_app_SUPABASE_URL
        || process.env.NEXT_PUBLIC_SUPABASE_URL
        || process.env.NEXT_PUBLIC_my_app_SUPABASE_URL)
    : (process.env.NEXT_PUBLIC_SUPABASE_URL
        || process.env.NEXT_PUBLIC_my_app_SUPABASE_URL)
) || 'https://placeholder.supabase.co'

const supabaseAnonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  || process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY
  || process.env.my_app_SUPABASE_ANON_KEY
  || process.env.SUPABASE_ANON_KEY
) || 'anon-key-placeholder'

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
          username: string | null
          password_hash: string | null
          avatar_url: string | null
          plan: 'free' | 'premium' | 'enterprise' | 'pro_monthly' | 'pro_yearly'
          usage_count: number
          storage_used_bytes: number
          max_storage_bytes: number
          points: number
          total_points_earned: number
          total_points_spent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username?: string | null
          password_hash?: string | null
          avatar_url?: string | null
          plan?: 'free' | 'premium' | 'enterprise' | 'pro_monthly' | 'pro_yearly'
          usage_count?: number
          storage_used_bytes?: number
          max_storage_bytes?: number
          points?: number
          total_points_earned?: number
          total_points_spent?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          password_hash?: string | null
          avatar_url?: string | null
          plan?: 'free' | 'premium' | 'enterprise' | 'pro_monthly' | 'pro_yearly'
          usage_count?: number
          storage_used_bytes?: number
          max_storage_bytes?: number
          points?: number
          total_points_earned?: number
          total_points_spent?: number
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
      generations: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          model_url: string | null
          image_url: string | null
          model_type: '3d' | 'image'
          generation_type: 'text-to-image' | 'image-edit' | 'image-to-3d' | 'text-to-3d'
          model_id: string | null
          model_name: string | null
          parameters: any | null
          points_cost: number
          status: 'pending' | 'processing' | 'completed' | 'failed'
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          model_url?: string | null
          image_url?: string | null
          model_type: '3d' | 'image'
          generation_type: 'text-to-image' | 'image-edit' | 'image-to-3d' | 'text-to-3d'
          model_id?: string | null
          model_name?: string | null
          parameters?: any | null
          points_cost: number
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          model_url?: string | null
          image_url?: string | null
          model_type?: '3d' | 'image'
          generation_type?: 'text-to-image' | 'image-edit' | 'image-to-3d' | 'text-to-3d'
          model_id?: string | null
          model_name?: string | null
          parameters?: any | null
          points_cost?: number
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      points_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: 'earned' | 'spent' | 'refunded' | 'bonus'
          description: string
          related_generation_id: string | null
          balance_before: number
          balance_after: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: 'earned' | 'spent' | 'refunded' | 'bonus'
          description: string
          related_generation_id?: string | null
          balance_before: number
          balance_after: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: 'earned' | 'spent' | 'refunded' | 'bonus'
          description?: string
          related_generation_id?: string | null
          balance_before?: number
          balance_after?: number
          created_at?: string
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
export type Generation = Tables['generations']['Row']
export type PointsTransaction = Tables['points_transactions']['Row']

// Points system configuration
export const POINTS_CONFIG = {
  GENERATION_COSTS: {
    'text-to-image': 3,
    'image-edit': 3,
    'image-to-3d': 3,
    'text-to-3d': 3,
  },
  DAILY_BONUS: 5,
  SIGNUP_BONUS: 10,
  REFERRAL_BONUS: 10,
}
