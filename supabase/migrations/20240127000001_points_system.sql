-- Migration: Add Points System and Generation Tracking
-- This migration adds points system functionality to the existing database

-- Add points columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS total_points_earned INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS total_points_spent INTEGER DEFAULT 0;

-- Create generations table
CREATE TABLE IF NOT EXISTS generations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    model_url TEXT,
    image_url TEXT,
    model_type VARCHAR(10) NOT NULL CHECK (model_type IN ('3d', 'image')),
    generation_type VARCHAR(20) NOT NULL CHECK (generation_type IN ('text-to-image', 'image-edit', 'image-to-3d', 'text-to-3d')),
    model_id VARCHAR(100) NOT NULL,
    parameters JSONB,
    points_cost INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create points_transactions table
CREATE TABLE IF NOT EXISTS points_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('earned', 'spent', 'refunded', 'bonus')),
    description VARCHAR(255) NOT NULL,
    related_generation_id UUID REFERENCES generations(id) ON DELETE SET NULL,
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_status ON generations(status);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON points_transactions(created_at DESC);

-- Add Row Level Security (RLS)
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for generations
CREATE POLICY "Users can view their own generations" ON generations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generations" ON generations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generations" ON generations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generations" ON generations
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for points_transactions
CREATE POLICY "Users can view their own points transactions" ON points_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points transactions" ON points_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_generations_updated_at
    BEFORE UPDATE ON generations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to check and deduct points
CREATE OR REPLACE FUNCTION deduct_points_for_generation(
    p_user_id UUID,
    p_points_cost INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    current_points INTEGER;
BEGIN
    -- Get current points
    SELECT points INTO current_points FROM users WHERE id = p_user_id;

    -- Check if user has enough points
    IF current_points < p_points_cost THEN
        RETURN FALSE;
    END IF;

    -- Deduct points
    UPDATE users
    SET
        points = points - p_points_cost,
        total_points_spent = total_points_spent + p_points_cost,
        updated_at = NOW()
    WHERE id = p_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to add points transaction
CREATE OR REPLACE FUNCTION add_points_transaction(
    p_user_id UUID,
    p_amount INTEGER,
    p_type VARCHAR(20),
    p_description VARCHAR(255),
    p_related_generation_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    balance_before INTEGER;
    balance_after INTEGER;
BEGIN
    -- Get current balance
    SELECT points INTO balance_before FROM users WHERE id = p_user_id;

    -- Calculate new balance
    balance_after := balance_before + p_amount;

    -- Insert transaction record
    INSERT INTO points_transactions (
        user_id,
        amount,
        type,
        description,
        related_generation_id,
        balance_before,
        balance_after
    ) VALUES (
        p_user_id,
        p_amount,
        p_type,
        p_description,
        p_related_generation_id,
        balance_before,
        balance_after
    );

    -- Update user points
    UPDATE users
    SET
        points = balance_after,
        total_points_earned = total_points_earned + GREATEST(p_amount, 0),
        total_points_spent = total_points_spent + GREATEST(-p_amount, 0),
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;