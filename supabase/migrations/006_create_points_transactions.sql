CREATE TABLE IF NOT EXISTS public.points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('earned','spent','refunded','bonus')),
  description TEXT NOT NULL,
  related_generation_id UUID REFERENCES public.generations(id) ON DELETE SET NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_points_trans_user_id ON public.points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_trans_created_at ON public.points_transactions(created_at DESC);
