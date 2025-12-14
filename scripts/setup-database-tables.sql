-- 创建必要的数据库表（如果不存在）

-- 1. points_transactions 表
CREATE TABLE IF NOT EXISTS public.points_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  type character varying(20) NOT NULL,
  description character varying(255) NULL,
  related_generation_id uuid NULL,
  balance_before integer NOT NULL DEFAULT 0,
  balance_after integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT points_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT points_transactions_type_check CHECK (
    (type)::text = ANY (
      (ARRAY['earned'::character varying, 'spent'::character varying, 'refund'::character varying, 'bonus'::character varying])::text[]
    )
  ),
  CONSTRAINT points_transactions_amount_check CHECK ((amount IS NOT NULL))
) TABLESPACE pg_default;

-- 2. generations 表
CREATE TABLE IF NOT EXISTS public.generations (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  user_id uuid NOT NULL,
  title character varying(255) NOT NULL,
  description text NULL,
  model_type character varying(10) NOT NULL,
  generation_type character varying(20) NOT NULL,
  model_id character varying(100) NOT NULL,
  parameters json NULL,
  model_url text NULL,
  image_url text NULL,
  points_cost integer NOT NULL DEFAULT 3,
  status character varying(20) NOT NULL DEFAULT 'processing',
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT generations_pkey PRIMARY KEY (id),
  CONSTRAINT generations_model_type_check CHECK (
    (model_type)::text = ANY ((ARRAY['3d'::character varying, 'image'::character varying])::text[])
  ),
  CONSTRAINT generations_status_check CHECK (
    (status)::text = ANY (
      (ARRAY['processing'::character varying, 'completed'::character varying, 'failed'::character varying])::text[]
    )
  ),
  CONSTRAINT generations_generation_type_check CHECK (
    (generation_type)::text = ANY (
      (ARRAY['text-to-image'::character varying, 'image-edit'::character varying, 'image-to-3d'::character varying, 'text-to-3d'::character varying])::text[]
    )
  )
) TABLESPACE pg_default;

-- 3. models 表（如果不存在）
CREATE TABLE IF NOT EXISTS public.models (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  user_id uuid NOT NULL,
  title character varying(255) NOT NULL,
  description text NULL,
  tags json NULL DEFAULT '[]'::json,
  file_url text NOT NULL,
  file_format character varying(10) NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  is_public boolean NOT NULL DEFAULT false,
  view_count integer NOT NULL DEFAULT 0,
  like_count integer NOT NULL DEFAULT 0,
  download_count integer NOT NULL DEFAULT 0,
  processing_status character varying(20) NOT NULL DEFAULT 'pending',
  metadata json NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT models_pkey PRIMARY KEY (id),
  CONSTRAINT models_file_format_check CHECK (
    (file_format)::text = ANY (
      (ARRAY['glb'::character varying, 'gltf'::character varying, 'obj'::character varying, 'fbx'::character varying, 'stl'::character varying, 'ply'::character varying])::text[]
    )
  ),
  CONSTRAINT models_processing_status_check CHECK (
    (processing_status)::text = ANY (
      (ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying])::text[]
    )
  )
) TABLESPACE pg_default;

-- 4. 添加外键约束
ALTER TABLE public.points_transactions
  ADD CONSTRAINT points_transactions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.generations
  ADD CONSTRAINT generations_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.models
  ADD CONSTRAINT models_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 5. 创建索引
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON public.points_transactions USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON public.points_transactions USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_generations_status ON public.generations USING btree (status);
CREATE INDEX IF NOT EXISTS idx_models_user_id ON public.models USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_models_is_public ON public.models USING btree (is_public);

-- 6. 添加触发器
DROP TRIGGER IF EXISTS update_points_transactions_updated_at ON public.points_transactions;
CREATE TRIGGER update_points_transactions_updated_at
  BEFORE UPDATE ON public.points_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_generations_updated_at ON public.generations;
CREATE TRIGGER update_generations_updated_at
  BEFORE UPDATE ON public.generations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_models_updated_at ON public.models;
CREATE TRIGGER update_models_updated_at
  BEFORE UPDATE ON public.models
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 完成
SELECT 'All tables setup completed' as status;