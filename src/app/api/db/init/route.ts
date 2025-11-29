'use server'

import { NextResponse } from 'next/server'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

function getEnv() {
  const baseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.my_app_SUPABASE_URL || process.env.NEXT_PUBLIC_my_app_SUPABASE_URL || '').trim()
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.my_app_SUPABASE_SERVICE_ROLE_KEY || '').trim()
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY || '').trim()
  const projectRef = (process.env.SUPABASE_PROJECT_REF || '').trim()
  const accessToken = (process.env.SUPABASE_ACCESS_TOKEN || '').trim()
  return { baseUrl, serviceKey, anonKey, projectRef, accessToken }
}

async function tableExists(baseUrl: string, anonKey: string, bearer: string, table: string) {
  try {
    const res = await fetch(`${baseUrl}/rest/v1/${table}?select=id&limit=1`, {
      headers: { 'Authorization': `Bearer ${bearer}`, 'apikey': anonKey }
    })
    return res.ok
  } catch {
    return false
  }
}

// SQL语句来创建所有必要的表
const initSQL = `
-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT,
    avatar_url TEXT,
    plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'enterprise')),
    usage_count INTEGER DEFAULT 0,
    storage_used_bytes BIGINT DEFAULT 0,
    max_storage_bytes BIGINT DEFAULT 104857600, -- 100MB default
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建模型表
CREATE TABLE IF NOT EXISTS models (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tags TEXT[],
    is_public BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    processing_status VARCHAR(20) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建模型文件表
CREATE TABLE IF NOT EXISTS model_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    format VARCHAR(10) NOT NULL CHECK (format IN ('glb', 'gltf', 'obj', 'fbx', 'stl')),
    vertex_count INTEGER,
    face_count INTEGER,
    size_bytes BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建模型浏览记录表
CREATE TABLE IF NOT EXISTS model_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- 创建交易记录表
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_models_user_id ON models(user_id);
CREATE INDEX IF NOT EXISTS idx_models_is_public ON models(is_public);
CREATE INDEX IF NOT EXISTS idx_models_created_at ON models(created_at);
CREATE INDEX IF NOT EXISTS idx_model_files_model_id ON model_files(model_id);
CREATE INDEX IF NOT EXISTS idx_model_views_model_id ON model_views(model_id);
CREATE INDEX IF NOT EXISTS idx_model_views_viewed_at ON model_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- 创建更新时间的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加更新时间触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_models_updated_at ON models;
CREATE TRIGGER update_models_updated_at
    BEFORE UPDATE ON models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 用户只能访问自己的记录
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- 公开的模型可以被所有人查看，用户只能管理自己的模型
CREATE POLICY "Models are viewable by everyone" ON models FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own models" ON models FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own models" ON models FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own models" ON models FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own models" ON models FOR DELETE USING (auth.uid()::text = user_id::text);

-- 模型文件的访问策略
CREATE POLICY "Model files are viewable based on model access" ON model_files FOR SELECT USING (
    EXISTS (SELECT 1 FROM models WHERE models.id = model_files.model_id AND (models.is_public = true OR auth.uid()::text = models.user_id::text))
);
CREATE POLICY "Users can insert files for own models" ON model_files FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM models WHERE models.id = model_files.model_id AND auth.uid()::text = models.user_id::text)
);
CREATE POLICY "Users can update files for own models" ON model_files FOR UPDATE USING (
    EXISTS (SELECT 1 FROM models WHERE models.id = model_files.model_id AND auth.uid()::text = models.user_id::text)
);
CREATE POLICY "Users can delete files for own models" ON model_files FOR DELETE USING (
    EXISTS (SELECT 1 FROM models WHERE models.id = model_files.model_id AND auth.uid()::text = models.user_id::text)
);

-- 浏览记录策略
CREATE POLICY "Users can view model views" ON model_views FOR SELECT USING (true);
CREATE POLICY "Users can insert model views" ON model_views FOR INSERT WITH CHECK (true);

-- 交易记录策略
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid()::text = user_id::text);
`

export async function GET() {
  const { baseUrl, serviceKey, anonKey, projectRef, accessToken } = getEnv()
  if (!baseUrl || !anonKey) {
    const missing = [
      !baseUrl ? 'NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL or my_app_SUPABASE_URL/NEXT_PUBLIC_my_app_SUPABASE_URL' : null,
      !anonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY/SUPABASE_ANON_KEY or NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY/my_app_SUPABASE_ANON_KEY' : null,
    ].filter(Boolean)
    return NextResponse.json({ status: 'error', message: 'Supabase env missing', missing }, { status: 500 })
  }

  const requiredTables = ['users','models','model_files','model_views','transactions','generations','points_transactions']
  const missing: string[] = []
  const existing: string[] = []
  const bearer = serviceKey || anonKey

  for (const t of requiredTables) {
    const ok = await tableExists(baseUrl, anonKey, bearer, t)
    if (!ok) missing.push(t)
    else existing.push(t)
  }

  if (missing.length === 0) {
    return NextResponse.json({
      status: 'ok',
      message: '所有表都已存在，数据库初始化完成',
      existing,
      missing: []
    })
  }

  return NextResponse.json({
    status: 'missing',
    message: '缺少必要的数据库表',
    existing,
    missing,
    totalRequired: requiredTables.length,
    totalExisting: existing.length,
    totalMissing: missing.length
  }, { status: 200 })
}

export async function POST() {
  const { baseUrl, serviceKey, anonKey, projectRef, accessToken } = getEnv()

  if (!baseUrl || !anonKey) {
    const missing = [
      !baseUrl ? 'NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL or my_app_SUPABASE_URL/NEXT_PUBLIC_my_app_SUPABASE_URL' : null,
      !anonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY/SUPABASE_ANON_KEY or NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY/my_app_SUPABASE_ANON_KEY' : null,
    ].filter(Boolean)
    return NextResponse.json({ status: 'error', message: 'Supabase env missing', missing }, { status: 500 })
  }

  const bearer = serviceKey || anonKey

  // 尝试通过Management API创建表
  if (projectRef && accessToken) {
    try {
      const resp = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/sql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: initSQL })
      })

      const body = await resp.json().catch(() => ({}))
      if (resp.ok) {
        return NextResponse.json({
          status: 'ok',
          message: '数据库初始化成功！所有表和策略已创建',
          result: body,
          sql: initSQL
        })
      } else {
        console.warn('Management API失败:', body)
      }
    } catch (error) {
      console.warn('Management API请求失败:', error)
    }
  }

  // 如果Management API不可用，返回SQL供手动执行
  return NextResponse.json({
    status: 'manual',
    message: '请手动在Supabase控制台执行以下SQL来初始化数据库',
    sql: initSQL,
    instructions: [
      '1. 打开Supabase控制台',
      '2. 进入SQL编辑器',
      '3. 复制并执行上面返回的SQL语句',
      '4. 执行完成后访问GET接口验证表是否创建成功'
    ],
    missingTables: ['users', 'models', 'model_files', 'model_views', 'transactions']
  })
}
