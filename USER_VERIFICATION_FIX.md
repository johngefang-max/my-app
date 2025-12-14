# 用户验证问题修复说明

## 问题描述
用户在使用生成功能时遇到 "用户验证失败: 无法创建或找到用户记录，请重新登录" 错误。

## 问题原因
1. API 调用时没有传递认证信息（Cookie）
2. 数据库可能缺少必要的触发器函数
3. 字段默认值不匹配

## 已完成的修复

### 1. 修复 API 调用认证问题 ✅
- **文件**: `src/app/api/fal/generate/route.ts`
- **修复**: 在调用 `/api/me/user` 时传递 Cookie 头部
- **影响**: 确保用户创建 API 能够获取到认证信息

### 2. 更新字段默认值 ✅
- **文件**: `src/app/api/me/user/route.ts`
- **修复**: 将 `max_storage_bytes` 默认值从 1073741824 改为 104857600 (100MB)
- **影响**: 与数据库默认值保持一致

### 3. 创建数据库设置脚本 ✅
- **文件**: `scripts/setup-users-table.sql`
- **内容**: 创建必要的触发器函数和索引
- **用途**: 确保数据库结构完整

## 需要在 Supabase 执行的 SQL

请登录 Supabase Dashboard，在 SQL Editor 中执行以下脚本：

```sql
-- 1. 创建更新 updated_at 字段的触发器函数
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

-- 4. 验证设置
SELECT 'User table setup completed' as status;
```

## 测试步骤

1. **执行数据库脚本**
   - 在 Supabase Dashboard 的 SQL Editor 中运行上述 SQL

2. **测试用户创建**
   - 访问: `https://your-domain/api/debug/user-creation`（需要先登录）
   - 查看用户是否正确创建

3. **测试生成功能**
   - 登录应用
   - 访问 `/generator` 页面
   - 尝试生成模型

## 调试端点

创建了调试端点来帮助排查问题：
- URL: `/api/debug/user-creation`
- 功能: 显示当前用户状态和数据库配置
- 用法: 登录后访问此端点查看详细信息

## 注意事项

1. 确保 Supabase 环境变量正确配置
2. 确保 NextAuth 正常工作
3. 检查 Supabase 中的 users 表是否有正确的权限设置

## 如果问题仍然存在

请检查：
1. Supabase 中的 users 表是否正确创建
2. API Keys 是否有足够的权限
3. RLS (Row Level Security) 策略是否阻止了用户创建
4. 查看浏览器控制台和服务器日志获取更多错误信息