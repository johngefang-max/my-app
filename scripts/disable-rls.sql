-- 禁用 RLS（因为我们使用 Service Role API）

-- 1. 禁用 RLS（最简单的解决方案）
ALTER TABLE public.points_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.models DISABLE ROW LEVEL SECURITY;

-- 2. 验证 RLS 已禁用
SELECT
  schemaname,
  tablename,
  rowsecurity,
  FOR
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('points_transactions', 'generations', 'models');

-- 3. 检查外键约束
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

-- 4. 检查索引
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('points_transactions', 'generations', 'models');

-- 完成
SELECT 'RLS disabled successfully' as status;