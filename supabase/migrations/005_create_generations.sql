CREATE TABLE IF NOT EXISTS public.generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  model_url TEXT,
  image_url TEXT,
  model_type VARCHAR(10) NOT NULL CHECK (model_type IN ('3d','image')),
  generation_type VARCHAR(20) NOT NULL CHECK (generation_type IN ('text-to-image','image-edit','image-to-3d','text-to-3d')),
  model_id UUID NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
  parameters JSONB,
  points_cost INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'processing' CHECK (status IN ('pending','processing','completed','failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at DESC);
