# "User not found" 错误调试指南

## 🔍 问题诊断

您遇到 "User not found" 错误，这可能是由以下原因造成的：

1. **用户认证状态不正确** - 用户可能没有正确登录
2. **用户ID不匹配** - 前端传递的用户ID与数据库中的不匹配
3. **数据库连接问题** - Supabase 连接或查询问题
4. **用户数据丢失** - 用户记录在数据库中不存在

## 🛠️ 调试步骤

### 步骤 1: 检查浏览器控制台

1. 打开浏览器开发者工具 (F12)
2. 切换到 "Console" 标签
3. 点击 "升级到 Pro - $9.99/月" 按钮
4. 查看控制台输出，应该会看到类似这样的信息：

```
Creem payment button clicked
Authentication status: true/false
User data: {...}
Creating payment request with userId: USER_ID
Payment API response status: 404/500
Payment API response data: {error: "User not found", ...}
```

### 步骤 2: 使用用户验证端点

在浏览器中访问以下URL来验证用户：

```
http://localhost:3000/api/debug/user?userId=YOUR_USER_ID
```

将 `YOUR_USER_ID` 替换为实际的用户ID（可以从控制台中获取）。

### 步骤 3: 检查用户登录状态

访问 `http://localhost:3000/profile` 查看用户是否正确登录。

## 🔧 可能的解决方案

### 解决方案 1: 重新登录

如果用户认证状态有问题，请尝试：
1. 退出登录
2. 清除浏览器缓存
3. 重新登录

### 解决方案 2: 检查用户数据

如果用户确实存在但查询失败，检查：

1. **Supabase 连接配置**：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   ```

2. **数据库权限**：确保匿名用户可以读取 `users` 表

### 解决方案 3: 手动创建用户记录

如果用户在 auth 系统中存在但不在数据库中，可以通过以下方式创建：

访问 `http://localhost:3000/api/me/user` 来创建或同步用户记录。

## 📋 检查清单

- [ ] 用户是否已正确登录？
- [ ] 控制台是否显示正确的用户ID？
- [ ] 用户验证端点是否返回用户数据？
- [ ] Supabase 连接是否正常？
- [ ] 数据库中是否存在用户记录？

## 🔧 开发者修复建议

我已经添加了详细的调试日志，您可以查看：

1. **前端日志** (浏览器控制台)
2. **后端日志** (终端运行 `npm run dev`)
3. **用户验证端点** (`/api/debug/user`)

## 🚀 如果问题仍然存在

如果以上步骤都无法解决问题，请提供：

1. 浏览器控制台的完整错误信息
2. 后端终端的日志输出
3. 用户验证端点的响应结果

这将帮助我进一步诊断和解决问题。