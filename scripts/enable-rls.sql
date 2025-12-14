-- 启用 RLS 并创建正确的策略

-- 1. 启用 RLS
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

-- 2. 删除现有的策略（如果存在）
DROP POLICY IF EXISTS "Users can view own points transactions" ON public.points_transactions;
DROP POLICY IF EXISTS "Users can insert own points transactions" ON public.points_transactions;
DROP POLICY IF EXISTS "Service role full access to points transactions" ON public.points_transactions;

DROP POLICY IF EXISTS "Users can view own generations" ON public.generations;
DROP POLICY IF EXISTS "Users can insert own generations" ON public.generations;
DROP POLICY IF EXISTS "Users can update own generations" ON public.generations;
DROP POLICY IF EXISTS "Service role full access to generations" ON public.generations;

DROP POLICY IF EXISTS "Users can view own models" ON public.models;
DROP POLICY IF EXISTS "Users can insert own models" ON public.models;
DROP POLICY IF EXISTS "Users can update own models" ON public.models;
DROP POLICY IF EXISTS "Service role full access to models" ON public.models;

-- 3. 创建 Service Role 策略（用于服务器端 API）
-- 注意：Service role 会绕过 RLS，但为了完整性我们仍然创建策略

CREATE POLICY "Service role full access to points transactions" ON public.points_transactions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to generations" ON public.generations
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to models" ON public.models
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 4. 允许匿名访问（因为我们使用 API Keys 而不是用户认证）
-- 这允许使用 service_role 或 anon_role 的请求访问数据

CREATE POLICY "Allow anonymous access to points transactions" ON public.points_transactions
  FOR ALL USING (true);

CREATE POLICY "Allow anonymous access to generations" ON public.generations
  FOR ALL USING (true);

CREATE POLICY "Allow anonymous access to models" ON public.models
  FOR ALL USING (true);

-- 5. 验证表结构
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('points_transactions', 'generations', 'models');

-- 6. 检查策略
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('points_transactions', 'generations', 'models');

-- 完成
SELECT 'RLS policies setup completed' as status;