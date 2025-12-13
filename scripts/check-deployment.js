#!/usr/bin/env node

/**
 * 部署验证脚本
 * 用于检查生产环境的支付接口是否正确部署
 */

const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://imageto3d.site';
const LOCAL_URL = 'http://localhost:3000';

// 要检查的API端点
const API_ENDPOINTS = [
  '/api/payments/creem/create',
  '/api/payments/creem/callback',
  '/api/payments/creem/return'
];

function checkEndpoint(baseUrl, endpoint) {
  return new Promise((resolve) => {
    const url = `${baseUrl}${endpoint}`;
    const client = url.startsWith('https') ? https : http;

    console.log(`\n🔍 检查端点: ${url}`);

    const req = client.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Deployment-Verification-Script/1.0'
      },
      timeout: 10000
    }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`   状态码: ${res.statusCode}`);

        if (res.statusCode === 404) {
          console.log(`   ❌ 404 - 端点不存在 (路由问题)`);
          resolve({
            endpoint,
            url,
            status: 'missing',
            statusCode: res.statusCode,
            error: 'Route not found'
          });
        } else if (res.statusCode === 401) {
          console.log(`   ✅ 401 - 端点存在但需要认证 (正常)`);
          resolve({
            endpoint,
            url,
            status: 'exists',
            statusCode: res.statusCode,
            note: 'Authentication required (normal)'
          });
        } else if (res.statusCode === 500) {
          console.log(`   ⚠️ 500 - 服务器内部错误 (可能缺少环境变量)`);
          resolve({
            endpoint,
            url,
            status: 'error',
            statusCode: res.statusCode,
            error: 'Internal server error (missing env vars?)'
          });
        } else {
          console.log(`   ✅ ${res.statusCode} - 端点正常响应`);
          try {
            const jsonData = JSON.parse(data);
            console.log(`   响应: ${JSON.stringify(jsonData, null, 2)}`);
          } catch (e) {
            console.log(`   响应: ${data}`);
          }
          resolve({
            endpoint,
            url,
            status: 'success',
            statusCode: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (err) => {
      console.log(`   ❌ 网络错误: ${err.message}`);
      resolve({
        endpoint,
        url,
        status: 'network_error',
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      console.log(`   ❌ 请求超时`);
      resolve({
        endpoint,
        url,
        status: 'timeout',
        error: 'Request timeout'
      });
    });

    // 发送空的POST请求体
    req.write('{}');
    req.end();
  });
}

async function main() {
  console.log('🚀 开始检查部署状态...\n');

  console.log('📋 检查项目:');
  console.log('1. 本地开发环境 (localhost:3000)');
  console.log('2. 生产环境 (imageto3d.site)');
  console.log('3. 支付相关的所有API端点');

  // 检查本地环境
  console.log('\n🏠 检查本地环境:');
  for (const endpoint of API_ENDPOINTS) {
    await checkEndpoint(LOCAL_URL, endpoint);
  }

  // 检查生产环境
  console.log('\n🌐 检查生产环境:');
  for (const endpoint of API_ENDPOINTS) {
    await checkEndpoint(PRODUCTION_URL, endpoint);
  }

  console.log('\n📊 部署状态检查完成！');
  console.log('\n💡 如果生产环境显示404错误，说明需要重新部署。');
  console.log('\n🛠️  解决方案:');
  console.log('1. 确保最新代码已推送到GitHub');
  console.log('2. 在Vercel/Netlify等平台重新部署');
  console.log('3. 检查生产环境的环境变量设置:');
  console.log('   - CREEM_API_KEY');
  console.log('   - CREEM_PRODUCT_ID');
  console.log('   - CREEM_API_URL');
  console.log('   - CREEM_SUCCESS_URL');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkEndpoint, API_ENDPOINTS };