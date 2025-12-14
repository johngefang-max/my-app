# Vercel 部署配置指南

## 1. 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

### Creem 支付配置
```
# Creem API 配置
CREEM_API_KEY=creem_test_3sioDtbY5ADbmoODbQnNiW
CREEM_PRODUCT_ID=prod_5JtwzQinzndziQS0Da8jkn
CREEM_API_URL=https://test-api.creem.io
```

### NextAuth 配置
```
# NextAuth 认证配置
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-here
AUTH_SECRET=your-secret-here

# Google OAuth (可选)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Supabase 配置
```
# Supabase 数据库配置
my_app_SUPABASE_URL=your-supabase-url
my_app_SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### FAL-AI 配置 (用于3D模型生成)
```
FAL_KEY=your-fal-api-key
```

## 2. 部署步骤

### 2.1 通过 GitHub 部署
1. 将代码推送到 GitHub 仓库
2. 在 Vercel 中导入项目
3. 连接 GitHub 仓库
4. 配置环境变量（见第1部分）
5. 点击 Deploy

### 2.2 通过 Vercel CLI 部署
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 在项目根目录运行
vercel

# 配置生产环境
vercel --prod
```

## 3. 支付回调配置

在 Creem 后台配置回调 URL：
- 成功回调 URL: `https://your-domain.vercel.app/api/creem/callback`
- 失败回调 URL: `https://your-domain.vercel.app/payment/failed`

## 4. 域名配置（可选）

如果使用自定义域名：
1. 在 Vercel 项目设置中添加自定义域名
2. 更新环境变量 `NEXTAUTH_URL` 为自定义域名
3. 在 Creem 后台更新回调 URL

## 5. 部署后测试

### 5.1 测试支付流程
1. 访问 `https://your-domain.vercel.app/pricing`
2. 点击订阅按钮
3. 确认跳转到 Creem 支付页面
4. 完成测试支付
5. 确认重定向到成功页面

### 5.2 测试支付回调
1. 在成功页面检查订单信息
2. 验证用户订阅状态已更新
3. 检查是否收到订阅积分

### 5.3 调试命令
```bash
# 查看部署日志
vercel logs

# 查看特定函数日志
vercel logs --filter="/api/payments/creem/create"
```

## 6. 生产环境配置

### 6.1 切换到生产环境
将以下环境变量更新为生产值：
```
# 生产环境 Creem API
CREEM_API_KEY=creem_live_your-production-api-key
CREEM_API_URL=https://api.creem.io
```

### 6.2 安全建议
- 确保 `NEXTAUTH_SECRET` 是一个强随机字符串
- 不要在客户端代码中暴露敏感密钥
- 定期轮换 API 密钥
- 启用 Vercel 的 SSL/TLS（默认启用）

## 7. 监控和错误处理

### 7.1 设置监控
在 Vercel 中可以查看：
- 函数执行时间
- 错误率
- 请求量统计

### 7.2 常见问题
1. **支付失败 403 错误**
   - 检查 CREEM_API_KEY 是否正确
   - 确认使用的是测试还是生产 API URL

2. **认证错误**
   - 检查 NEXTAUTH_URL 是否与部署域名匹配
   - 确保 AUTH_SECRET 已设置

3. **数据库连接错误**
   - 验证 Supabase URL 和密钥
   - 检查 Supabase 中的用户表结构

## 8. 回滚方案

如果部署出现问题：
```bash
# 回滚到上一个部署
vercel rollback

# 或者通过 Vercel Dashboard
1. 进入项目 Dashboard
2. 点击 Deployments
3. 找到上一个稳定版本
4. 点击菜单选择 Promote to Production
```

## 9. 性能优化建议

1. **函数缓存** - 启用 Vercel Edge Functions 的缓存
2. **图片优化** - 使用 Next.js Image 组件
3. **代码分割** - 确保动态导入大型依赖
4. **CDN** - Vercel 自动提供全球 CDN

## 10. 联系信息

如果遇到问题：
- Vercel 支持: support@vercel.com
- Creem 文档: https://docs.creem.io
- Supabase 支持: support@supabase.io