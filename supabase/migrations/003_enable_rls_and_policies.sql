-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users policies (users can only update their own profile)
CREATE POLICY "Users can view all user profiles" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Models policies
-- Public models can be viewed by anyone
CREATE POLICY "Public models are viewable by everyone" ON models
    FOR SELECT USING (is_public = true);

-- Users can view their own models
CREATE POLICY "Users can view own models" ON models
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own models
CREATE POLICY "Users can create own models" ON models
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own models
CREATE POLICY "Users can update own models" ON models
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own models
CREATE POLICY "Users can delete own models" ON models
    FOR DELETE USING (auth.uid() = user_id);

-- Model files policies
-- Public model files can be viewed by anyone
CREATE POLICY "Public model files are viewable by everyone" ON model_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM models 
            WHERE models.id = model_files.model_id 
            AND models.is_public = true
        )
    );

-- Users can view their own model files
CREATE POLICY "Users can view own model files" ON model_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM models 
            WHERE models.id = model_files.model_id 
            AND models.user_id = auth.uid()
        )
    );

-- Users can manage their own model files
CREATE POLICY "Users can manage own model files" ON model_files
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM models 
            WHERE models.id = model_files.model_id 
            AND models.user_id = auth.uid()
        )
    );

-- Model views policies
-- Anyone can create a view record (for tracking)
CREATE POLICY "Anyone can create view records" ON model_views
    FOR INSERT WITH CHECK (true);

-- Users can view their own view records
CREATE POLICY "Users can view own view records" ON model_views
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Transactions policies
-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own transactions
CREATE POLICY "Users can create own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT ON users TO anon;
GRANT SELECT, UPDATE ON users TO authenticated;
GRANT SELECT ON models TO anon;
GRANT ALL ON models TO authenticated;
GRANT SELECT ON model_files TO anon;
GRANT ALL ON model_files TO authenticated;
GRANT INSERT, SELECT ON model_views TO anon;
GRANT ALL ON model_views TO authenticated;
GRANT SELECT, INSERT ON transactions TO authenticated;