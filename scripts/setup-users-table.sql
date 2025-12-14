-- 更新用户表的SQL脚本

-- 1. 创建更新 updated_at 字段的触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. 应用触发器到users表
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. 确保索引存在
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users USING btree (email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users USING btree (username);

-- 4. 检查并更新现有数据（可选）
-- UPDATE public.users
-- SET max_storage_bytes = 104857600
-- WHERE max_storage_bytes IS NULL OR max_storage_bytes = 1073741824;

-- 5. 启用RLS（行级安全）- 如果需要
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 6. 创建策略（如果需要RLS）
-- DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
-- CREATE POLICY "Users can view own profile" ON public.users
--     FOR SELECT USING (auth.uid()::text = id::text);

-- DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
-- CREATE POLICY "Users can update own profile" ON public.users
--     FOR UPDATE USING (auth.uid()::text = id::text);

-- 完成
SELECT 'User table setup completed' as status;