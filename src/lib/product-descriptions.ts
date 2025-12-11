/**
 * Product descriptions for Creem payment system
 * Centralized configuration for all product-related text
 */

export interface ProductDescription {
  short: string
  standard: string
  detailed: string
  keywords: string[]
}

export interface PlanDescriptions {
  pro_monthly: ProductDescription
  pro_yearly: ProductDescription
}

export const productDescriptions: PlanDescriptions = {
  pro_monthly: {
    short: 'imageto3d Pro - 月度订阅 ($9.99/月)',
    standard: 'imageto3d Pro - 月度订阅。AI驱动的3D模型生成平台，包含文字/图片/草图转3D功能，支持商业使用，优先处理。',
    detailed: `imageto3d Pro 月度订阅

通过最前沿的人工智能技术，imageto3d让3D模型创作变得前所未有的简单。

核心功能：
• 文字到3D：用自然语言描述生成复杂3D模型
• 图片到3D：将照片、插画转换为立体模型
• 草图建模：手绘概念快速数字化
• 专业材质：自动生成逼真纹理和材质
• 实时预览：浏览器内360度预览编辑
• 多格式导出：支持GLB、GLTF、OBJ、FBX、STL

月度特权：
✅ 100次月度生成额度
✅ 高质量模型输出
✅ 优先处理速度
✅ 完整商业使用许可
✅ 所有导出格式支持
✅ 优先客户支持
✅ 100积分奖励`,
    keywords: ['AI 3D生成', '文字转3D', '图片转3D', '草图建模', '商业授权', '高质量输出']
  },

  pro_yearly: {
    short: 'imageto3d Pro - 年度订阅 ($99.99/年，节省17%)',
    standard: 'imageto3d Pro - 年度订阅。AI驱动的3D模型生成平台，包含文字/图片/草图转3D功能，支持商业使用，优先处理。年度订阅节省17%费用。',
    detailed: `imageto3d Pro 年度订阅

通过最前沿的人工智能技术，imageto3d让3D模型创作变得前所未有的简单。

核心功能：
• 文字到3D：用自然语言描述生成复杂3D模型
• 图片到3D：将照片、插画转换为立体模型
• 草图建模：手绘概念快速数字化
• 专业材质：自动生成逼真纹理和材质
• 实时预览：浏览器内360度预览编辑
• 多格式导出：支持GLB、GLTF、OBJ、FBX、STL

年度特权：
✅ 100次月度生成额度
✅ 高质量模型输出
✅ 优先处理速度
✅ 完整商业使用许可
✅ 所有导出格式支持
✅ 优先客户支持
✅ 500积分奖励
✅ 节省17%费用
✅ 年度专属客服支持`,
    keywords: ['AI 3D生成', '文字转3D', '图片转3D', '草图建模', '商业授权', '高质量输出', '年度优惠']
  }
}

// English versions
export const productDescriptionsEN: PlanDescriptions = {
  pro_monthly: {
    short: 'imageto3d Pro - Monthly Subscription ($9.99/month)',
    standard: 'imageto3d Pro - Monthly subscription. AI-powered 3D model generation platform with text/image/sketch to 3D conversion, commercial usage rights, and priority processing.',
    detailed: `imageto3d Pro Monthly Subscription

Cutting-edge AI technology makes 3D model creation easier than ever before.

Core Features:
• Text to 3D: Generate complex 3D models using natural language descriptions
• Image to 3D: Convert photos and illustrations into 3D models
• Sketch Modeling: Quickly digitize hand-drawn concepts
• Professional Materials: Automatically generate realistic textures and materials
• Real-time Preview: 360-degree preview and editing in browser
• Multi-format Export: Support for GLB, GLTF, OBJ, FBX, STL

Monthly Benefits:
✅ 100 monthly generation credits
✅ High-quality model output
✅ Priority processing speed
✅ Full commercial use license
✅ All export format support
✅ Priority customer support
✅ 100 bonus points`,
    keywords: ['AI 3D Generation', 'Text to 3D', 'Image to 3D', 'Sketch Modeling', 'Commercial License', 'High Quality Output']
  },

  pro_yearly: {
    short: 'imageto3d Pro - Yearly Subscription ($99.99/year, save 17%)',
    standard: 'imageto3d Pro - Yearly subscription. AI-powered 3D model generation platform with text/image/sketch to 3D conversion, commercial usage rights, and priority processing. Save 17% with annual plan.',
    detailed: `imageto3d Pro Yearly Subscription

Cutting-edge AI technology makes 3D model creation easier than ever before.

Core Features:
• Text to 3D: Generate complex 3D models using natural language descriptions
• Image to 3D: Convert photos and illustrations into 3D models
• Sketch Modeling: Quickly digitize hand-drawn concepts
• Professional Materials: Automatically generate realistic textures and materials
• Real-time Preview: 360-degree preview and editing in browser
• Multi-format Export: Support for GLB, GLTF, OBJ, FBX, STL

Yearly Benefits:
✅ 100 monthly generation credits
✅ High-quality model output
✅ Priority processing speed
✅ Full commercial use license
✅ All export format support
✅ Priority customer support
✅ 500 bonus points
✅ Save 17% compared to monthly
✅ Exclusive yearly support`,
    keywords: ['AI 3D Generation', 'Text to 3D', 'Image to 3D', 'Sketch Modeling', 'Commercial License', 'High Quality Output', 'Annual Savings']
  }
}

/**
 * Get product description by plan ID and language
 */
export function getProductDescription(planId: string, language: 'zh' | 'en' = 'zh', type: 'short' | 'standard' | 'detailed' = 'standard'): string {
  const descriptions = language === 'en' ? productDescriptionsEN : productDescriptions

  if (descriptions[planId as keyof PlanDescriptions]) {
    return descriptions[planId as keyof PlanDescriptions][type]
  }

  // Fallback
  return `${language === 'en' ? 'imageto3d Pro' : 'imageto3d Pro'} - ${planId}`
}

/**
 * Get product keywords by plan ID and language
 */
export function getProductKeywords(planId: string, language: 'zh' | 'en' = 'zh'): string[] {
  const descriptions = language === 'en' ? productDescriptionsEN : productDescriptions

  if (descriptions[planId as keyof PlanDescriptions]) {
    return descriptions[planId as keyof PlanDescriptions].keywords
  }

  return []
}

/**
 * Get all product info for payment processing
 */
export function getPaymentProductInfo(planId: string, language: 'zh' | 'en' = 'zh') {
  const descriptions = language === 'en' ? productDescriptionsEN : productDescriptions

  return {
    name: 'imageto3d',
    planId: planId,
    description: getProductDescription(planId, language, 'standard'),
    keywords: getProductKeywords(planId, language),
    detailedDescription: getProductDescription(planId, language, 'detailed')
  }
}