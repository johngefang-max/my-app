-- 修改 generations 表，添加 model_name 字段
-- 保留 model_id 作为外键（可为空），用于关联实际保存的模型
-- 添加 model_name 字段用于记录使用的生成模型标识符

-- 添加 model_name 字段
ALTER TABLE public.generations
ADD COLUMN IF NOT EXISTS model_name character varying(255);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_generations_model_name ON public.generations USING btree (model_name);

-- 更新现有记录（如果有的话）
UPDATE public.generations
SET model_name = 'unknown'
WHERE model_name IS NULL AND model_id IS NOT NULL;