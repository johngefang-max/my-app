-- 正确的 RLS 设置方案

-- 重要：由于我们使用 REST API 和 service_role key，有以下选择：

-- 选择 1：禁用 RLS（最简单，因为 service_role 绕过 RLS）
ALTER TABLE public.points_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.models DISABLE ROW LEVEL SECURITY;

-- 选择 2：如果必须启用 RLS，执行以下：

-- 2.1 启用 RLS
-- ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

-- 2.2 创建允许所有访问的策略（service_role 会绕过，anon_role 需要）
-- CREATE POLICY "Enable all access for API" ON public.points_transactions FOR ALL;
-- CREATE POLICY "Enable all access for API" ON public.generations FOR ALL;
-- CREATE POLICY "Enable all access for API" ON public.models FOR ALL;

-- 3. 检查当前的 RLS 状态
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('points_transactions', 'generations', 'models');

-- 4. 检查外键约束
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type IN ('FOREIGN KEY')
  AND tc.table_name IN ('points_transactions', 'generations', 'models');

-- 5. 测试数据插入（可选）
-- SELECT 'Testing data insertion...' as status;
-- INSERT INTO public.points_transactions (user_id, amount, type, description, balance_before, balance_after)
-- VALUES ('test-user-id', 10, 'earned', 'Test transaction', 0, 10)
-- ON CONFLICT DO NOTHING;

-- 完成
SELECT 'RLS configuration checked. Tables should be accessible now.' as status;