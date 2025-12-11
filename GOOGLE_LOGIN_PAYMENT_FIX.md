# 🛠️ Google登录和支付系统修复指南

## 🎯 问题分析

根据您提供的数据库结构，我发现了以下问题：

1. **数据库字段不匹配**: 代码中使用了 `subscription_status` 等字段，但数据库中不存在
2. **Google登录用户ID问题**: 使用邮箱而不是用户ID来查找用户
3. **类型定义不正确**: TypeScript类型定义与实际数据库结构不符

## ✅ 已修复的问题

### 1. 数据库类型定义修复
- 更新了 `src/lib/supabase.ts` 中的类型定义
- 添加了 `pro_monthly` 和 `pro_yearly` 到 plan 类型
- 移除了不存在的 `subscription_status` 等字段

### 2. 用户认证修复
- 修复了 `AuthContext.tsx` 中的用户数据获取逻辑
- 改进了用户名处理（使用username或邮箱前缀）
- 修复了Pro用户检查逻辑

### 3. 支付系统修复
- 修复了支付回调处理中的字段使用
- 移除了不存在的订阅状态字段
- 改进了错误处理和日志记录

### 4. 调试工具
- 创建了数据库连接测试: `/api/debug/database`
- 创建了用户验证工具: `/api/debug/user`
- 创建了用户同步API: `/api/user/sync`

## 🔍 调试步骤

### 步骤 1: 检查数据库连接
访问: `http://localhost:3000/api/debug/database`

### 步骤 2: 测试Google登录
1. 使用Google登录
2. 检查浏览器控制台是否有用户创建日志
3. 访问: `http://localhost:3000/api/debug/user?userId=USER_ID`

### 步骤 3: 验证支付系统
1. 确保用户已正确登录
2. 检查用户是否存在于数据库
3. 尝试点击支付按钮

## 🛠️ 手动修复步骤

如果仍然有问题，可以手动创建用户记录：

1. **通过API创建用户**:
```bash
curl -X POST http://localhost:3000/api/user/sync \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@gmail.com",
    "name": "Your Name",
    "avatar_url": "optional-avatar-url"
  }'
```

2. **检查用户是否创建成功**:
```bash
curl "http://localhost:3000/api/debug/user?email=your-email@gmail.com"
```

## 📊 数据库表结构（当前）

```sql
create table public.users (
  id uuid not null default gen_random_uuid (),
  email character varying(255) not null,
  username character varying(100) null,
  password_hash text null,
  avatar_url text null,
  plan character varying(20) null default 'free'::character varying,
  usage_count integer null default 0,
  storage_used_bytes bigint null default 0,
  max_storage_bytes bigint null default 104857600,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  points integer not null default 0,
  total_points_earned integer not null default 0,
  total_points_spent integer not null default 0,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email)
);
```

## ⚠️ 注意事项

1. **数据库约束**: `plan` 字段有检查约束，只允许 'free', 'premium', 'enterprise'
2. **Pro订阅**: 需要更新数据库约束以支持 'pro_monthly', 'pro_yearly'
3. **用户查找**: 主要使用邮箱来查找用户，而不是用户ID

## 🚀 下一步操作

1. **测试本地构建**: `npm run build`
2. **测试登录功能**: 使用Google登录测试
3. **测试支付功能**: 登录后测试支付按钮
4. **检查日志**: 查看浏览器控制台和服务器日志

如果需要更新数据库约束，请执行：

```sql
ALTER TABLE users DROP CONSTRAINT users_plan_check;
ALTER TABLE users ADD CONSTRAINT users_plan_check
  CHECK (plan IN ('free', 'premium', 'enterprise', 'pro_monthly', 'pro_yearly'));
```

## 🔧 如果问题仍然存在

1. **提供详细的错误信息**: 浏览器控制台和服务器日志
2. **检查环境变量**: 确保 Supabase 连接信息正确
3. **验证数据库权限**: 匿客权限是否允许读取 users 表
4. **手动创建测试用户**: 通过API直接创建用户记录