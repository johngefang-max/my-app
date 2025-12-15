-- 修改 generations 表的 model_id 字段，使其可为空
-- 这允许在没有创建实际 model 记录的情况下也能创建 generation 记录

-- 首先删除外键约束（如果存在）
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'generations_model_id_fkey'
        AND table_name = 'generations'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.generations DROP CONSTRAINT generations_model_id_fkey;
    END IF;
END $$;

-- 修改 model_id 字段为可为空
ALTER TABLE public.generations
ALTER COLUMN model_id DROP NOT NULL;

-- 重新添加外键约束，但允许 NULL 值
ALTER TABLE public.generations
ADD CONSTRAINT generations_model_id_fkey
FOREIGN KEY (model_id) REFERENCES public.models(id) ON DELETE CASCADE;