#!/usr/bin/env node

/**
 * 修复API路由中的路径别名问题
 * 将 @/ 路径别名转换为相对路径，以确保生产环境正常工作
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');
const API_DIR = path.join(SRC_DIR, 'app', 'api');

// 需要替换的路径映射
const PATH_MAPPINGS = {
  '@/lib/supabase': '../../../lib/supabase',
  '@/lib/points-service': '../../../lib/points-service',
  '@/services/creem': '../../../services/creem',
  '@/lib/utils': '../../../lib/utils',
  '@/types/model-viewer': '../../../types/model-viewer',
  '@/types/react-three-fiber': '../../../types/react-three-fiber',
  '@/store/useStore': '../../../store/useStore'
};

function fixImportsInFile(filePath) {
  if (!fs.existsSync(filePath)) return false;

  const content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  let newContent = content;

  // 替换所有导入路径
  for (const [alias, relative] of Object.entries(PATH_MAPPINGS)) {
    const regex = new RegExp(`from '${alias}'`, 'g');
    if (newContent.match(regex)) {
      newContent = newContent.replace(regex, `from '${relative}'`);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, newContent);
    console.log(`✅ 修复了文件: ${filePath}`);
    return true;
  }

  return false;
}

function findAndFixApiRoutes(dir, depth = 0) {
  if (depth > 5) return; // 防止无限递归

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      findAndFixApiRoutes(itemPath, depth + 1);
    } else if (item === 'route.ts' && itemPath.includes('/api/')) {
      fixImportsInFile(itemPath);
    }
  }
}

function main() {
  console.log('🔧 开始修复API路由中的路径别名...\n');

  if (!fs.existsSync(API_DIR)) {
    console.error('❌ API目录不存在:', API_DIR);
    process.exit(1);
  }

  console.log('📁 扫描目录:', API_DIR);
  console.log('\n🔄 正在替换路径别名...');

  let fixedCount = 0;
  const items = fs.readdirSync(API_DIR);

  for (const item of items) {
    const itemPath = path.join(API_DIR, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      findAndFixApiRoutes(itemPath);
    }
  }

  console.log('\n✨ 路径别名修复完成！');
  console.log('\n📝 修复的路径映射:');
  Object.entries(PATH_MAPPINGS).forEach(([alias, relative]) => {
    console.log(`  ${alias} → ${relative}`);
  });
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fixImportsInFile, findAndFixApiRoutes };