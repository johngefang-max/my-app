'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'zh' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// 检测用户浏览器的语言偏好
const detectBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return 'zh'
  
  const browserLang = navigator.language || navigator.languages[0]
  return browserLang?.startsWith('zh') ? 'zh' : 'en'
}

// 从cookie或localStorage获取保存的语言
const getSavedLanguage = (): Language => {
  if (typeof window === 'undefined') return 'zh'
  
  try {
    // 优先使用cookie - 更高效的解析方式
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('language='))
      ?.split('=')[1]
    
    if (cookieValue && (cookieValue === 'zh' || cookieValue === 'en')) {
      return cookieValue as Language
    }
    
    // 其次使用localStorage
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
      return savedLanguage
    }
    
    // 最后使用浏览器语言检测
    return detectBrowserLanguage()
  } catch (error) {
    return detectBrowserLanguage()
  }
}

const translations = {
  zh: {
    // 导航
    'nav.product': '产品',
    'nav.pricing': '定价',
    'nav.api': 'API',
    'nav.help': '帮助',
    'nav.login': '登录',
    'nav.startTrial': '开始免费试用',
    'nav.browseWorks': '浏览作品',
    'nav.createModel': '创建模型',
    'nav.myWorks': '我的作品',
    
    // 主页
    'home.title': 'AI驱动的',
    'home.title.highlight': '3D模型生成',
    'home.subtitle': '将文字描述、图片或草图瞬间转换为高质量的3D模型。无需专业技能，AI让3D创作变得简单高效。',
    'home.startCreating': '立即开始创作',
    'home.watchDemo': '观看演示',
    'home.activeUsers': '活跃用户',
    'home.generatedModels': '生成模型',
    'home.accuracy': '准确率',
    'home.generationTime': '生成时间',
    'home.features.title': '强大功能，简单易用',
    'home.features.subtitle': '多种输入方式，专业级输出质量',
    'home.feature1.title': '图片转3D',
    'home.feature1.desc': '上传图片，AI自动分析并生成精确的3D模型，支持多角度图片输入',
    'home.feature1.bullet1': '支持JPG、PNG格式',
    'home.feature1.bullet2': '自动识别物体轮廓',
    'home.feature1.bullet3': '智能纹理映射',
    'home.feature2.title': '文本生成',
    'home.feature2.desc': '用文字描述你的想法，AI将其转化为详细的3D模型',
    'home.feature2.bullet1': '自然语言处理',
    'home.feature2.bullet2': '风格自定义',
    'home.feature2.bullet3': '实时预览',
    'home.feature3.title': '专业品质',
    'home.feature3.desc': '生成符合工业标准的3D模型，可直接用于游戏、影视、建筑等领域',
    'home.feature3.bullet1': '高分辨率网格',
    'home.feature3.bullet2': 'PBR材质支持',
    'home.feature3.bullet3': '多格式导出',
    'home.demo.title': '看看AI的魔力',
    'home.demo.subtitle': '从简单输入到精美3D模型，只需几秒钟',
    'home.cta.title': '准备好开始了吗？',
    'home.cta.subtitle': '加入数千名创作者的行列，用AI加速你的3D创作流程',
    'home.cta.freeTrial': '免费试用7天',
    'home.cta.viewPricing': '查看定价方案',
    'home.footer.support': '无需信用卡 • 随时取消 • 24/7客服支持',
    
    // 定价页
    'pricing.title': '选择适合你的',
    'pricing.title.highlight': '定价方案',
    'pricing.subtitle': '从个人创作者到企业团队，我们提供灵活的定价方案，满足不同需求',
    'pricing.monthly': '按月付费',
    'pricing.yearly': '按年付费',
    'pricing.save': '节省20%',
    'pricing.free.title': '免费版',
    'pricing.free.price': '¥0',
    'pricing.free.period': '永久免费',
    'pricing.free.feature1': '每月10次生成',
    'pricing.free.feature2': '基础模型质量',
    'pricing.free.feature3': '标准渲染速度',
    'pricing.free.feature4': '社区支持',
    'pricing.free.feature5': '基础导出格式',
    'pricing.free.current': '当前方案',
    'pricing.pro.title': '专业版',
    'pricing.pro.price': '$15',
    'pricing.pro.period': '/月',
    'pricing.pro.yearly': '按年付费 $12/月',
    'pricing.pro.feature1': '每月100次生成',
    'pricing.pro.feature2': '高质量模型',
    'pricing.pro.feature3': '快速渲染',
    'pricing.pro.feature4': '优先客服支持',
    'pricing.pro.feature5': '所有导出格式',
    'pricing.pro.feature6': '商业使用许可',
    'pricing.pro.feature7': '无水印导出',
    'pricing.pro.feature8': '批量处理',
    'pricing.pro.choose': '选择专业版',
    'pricing.compare.title': '功能对比',
    'pricing.compare.subtitle': '详细了解每个方案的功能差异',
    'pricing.faq.title': '常见问题',
    'pricing.faq.subtitle': '了解更多关于定价的详细信息',
    'pricing.faq.q1': '可以随时更改或取消订阅吗？',
    'pricing.faq.a1': '是的，您可以随时升级、降级或取消订阅。更改会立即生效，我们会按比例退还剩余时间的费用。',
    'pricing.faq.q2': '免费版有什么限制？',
    'pricing.faq.a2': '免费版每月提供10次生成机会，使用基础模型质量和标准渲染速度。生成的模型可以用于个人学习，但不支持商业使用。',
    'pricing.faq.q3': '支持哪些付款方式？',
    'pricing.faq.a3': '我们支持支付宝、微信支付、银联卡等主流付款方式。企业版还支持银行转账和对公付款。',
    'pricing.faq.q4': '生成的模型可以用于商业项目吗？',
    'pricing.faq.a4': '付费用户（专业版及以上）拥有生成模型的商业使用许可。您可以将其用于游戏开发、影视制作、建筑设计等商业项目。',
    'pricing.cta.title': '准备好开始了吗？',
    'pricing.cta.subtitle': '选择免费试用，体验AI驱动的3D模型生成魔力',
    'pricing.cta.freeTrial': '免费试用7天',
    'pricing.cta.watchDemo': '观看演示',
    'pricing.footer.support': '无需信用卡 • 随时取消 • 24/7客服支持',
    
    // 生成器页
    'generator.title': '创造你的',
    'generator.title.highlight': '3D世界',
    'generator.subtitle': '选择输入方式，让AI为你生成精美的3D模型',
    'generator.input.title': '选择输入方式',
    'generator.input.text': '文本描述',
    'generator.input.text.desc': '输入文字描述',
    'generator.input.image': '图片输入',
    'generator.input.image.desc': '上传参考图片',
    'generator.input.sketch': '手绘草图',
    'generator.input.sketch.desc': '简单手绘输入',
    'generator.text.placeholder': '描述你想要生成的3D模型...\n\n例如：一只可爱的卡通猫咪，橘色毛发，绿色大眼睛，坐在垫子上',
    'generator.text.characters': '字符',
    'generator.text.random': '随机示例',
    'generator.text.optimize': '优化描述',
    'generator.image.upload': '点击上传或拖拽图片到此处',
    'generator.image.support': '支持 JPG、PNG、WEBP 格式，最大 10MB',
    'generator.sketch.draw': '点击开始绘制',
    'generator.sketch.support': '支持鼠标和触控笔',
    'generator.settings.title': '生成设置',
    'generator.settings.style': '模型风格',
    'generator.settings.style.realistic': '写实风格',
    'generator.settings.style.cartoon': '卡通风格',
    'generator.settings.style.lowpoly': '低多边形',
    'generator.settings.style.cyberpunk': '赛博朋克',
    'generator.settings.style.retro': '复古风格',
    'generator.settings.quality': '细节程度',
    'generator.settings.quality.low': '低',
    'generator.settings.quality.medium': '中',
    'generator.settings.quality.high': '高',
    'generator.settings.format': '输出格式',
    'generator.settings.format.obj': 'OBJ',
    'generator.settings.format.fbx': 'FBX',
    'generator.settings.format.gltf': 'GLTF',
    'generator.generate': '开始生成',
    'generator.generating': '生成中...',
    'generator.preview.title': '3D预览',
    'generator.preview.waiting': '等待生成',
    'generator.preview.waiting.desc': '输入内容并点击生成按钮',
    'generator.preview.generated': '3D模型已生成',
    'generator.preview.drag': '拖拽旋转查看不同角度',
    'generator.info.title': '模型信息',
    'generator.info.polygons': '多边形数',
    'generator.info.vertices': '顶点数',
    'generator.info.texture': '纹理分辨率',
    'generator.info.size': '文件大小',
    'generator.download': '下载模型',
    'generator.edit': '编辑模型',
    'generator.share': '分享作品',
    
    // 画廊页
    'gallery.title': '探索AI生成的',
    'gallery.title.highlight': '3D艺术世界',
    'gallery.subtitle': '发现社区创作者分享的精美3D模型，从建筑到角色，从家具到艺术品',
    'gallery.search.placeholder': '搜索3D模型...',
    'gallery.category.all': '所有类别',
    'gallery.category.architecture': '建筑',
    'gallery.category.character': '角色',
    'gallery.category.furniture': '家具',
    'gallery.category.vehicle': '车辆',
    'gallery.category.animal': '动物',
    'gallery.search': '搜索',
    'gallery.featured.title': '本周精选',
    'gallery.featured.subtitle': '社区最受欢迎的3D模型',
    'gallery.model.by': '由',
    'gallery.model.created': '创建',
    'gallery.model.polygons': '多边形数',
    'gallery.model.texture': '纹理分辨率',
    'gallery.model.format': '文件格式',
    'gallery.model.generationTime': '生成时间',
    'gallery.model.download': '下载模型',
    'gallery.model.share': '分享',
    'gallery.model.like': '收藏',
    'gallery.latest.title': '最新作品',
    'gallery.latest': '最新',
    'gallery.popular': '热门',
    'gallery.favorites': '收藏',
    'gallery.createModel': '创建模型',
    'gallery.loadMore': '加载更多模型',
    
    // 通用
    'common.and': '和',
    'common.or': '或',
    'common.cancel': '取消',
    'common.save': '保存',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.share': '分享',
    'common.download': '下载',
    'common.like': '喜欢',
    'common.view': '查看',
    'common.search': '搜索',
    'common.loading': '加载中...',
    'common.error': '出错了',
    'common.retry': '重试',
    'common.close': '关闭',
    'common.back': '返回',
    'common.next': '下一步',
    'common.previous': '上一步',
    'common.finish': '完成',
    'common.continue': '继续',
    'common.skip': '跳过',
    'common.ok': '确定',
    'common.yes': '是',
    'common.no': '否',
    'common.on': '开启',
    'common.off': '关闭',
    'common.enabled': '已启用',
    'common.disabled': '已禁用',
    'common.optional': '可选',
    'common.required': '必填',
    'common.preview': '预览',
    'common.settings': '设置',
    'common.help': '帮助',
    'common.about': '关于',
    'common.contact': '联系我们',
    'common.privacy': '隐私政策',
    'common.terms': '服务条款',
    'common.copyright': '版权所有'
  },
  en: {
    // Navigation
    'nav.product': 'Product',
    'nav.pricing': 'Pricing',
    'nav.api': 'API',
    'nav.help': 'Help',
    'nav.login': 'Login',
    'nav.startTrial': 'Start for free',
    'nav.browseWorks': 'Browse Works',
    'nav.createModel': 'Create Model',
    'nav.myWorks': 'My Works',
    
    // Home
    'home.title': 'AI-Powered',
    'home.title.highlight': '3D Model Generation',
    'home.subtitle': 'Turn ideas, images, or quick sketches into production-ready 3D in minutes. No 3D background needed — just describe, and let AI do the heavy lifting.',
    'home.startCreating': 'Start creating',
    'home.activeUsers': 'Active Users',
    'home.generatedModels': 'Generated Models',
    'home.accuracy': 'Accuracy',
    'home.generationTime': 'Generation Time',
    'home.features.title': 'Built for creators',
    'home.features.subtitle': 'Flexible inputs, consistent high‑quality output',
    'home.feature1.title': 'Image to 3D',
    'home.feature1.desc': 'Drop in a photo — get a clean, textured 3D mesh with smart reconstruction.',
    'home.feature1.bullet1': 'JPG/PNG support',
    'home.feature1.bullet2': 'Robust object detection',
    'home.feature1.bullet3': 'Intelligent UV & textures',
    'home.feature2.title': 'Text to 3D',
    'home.feature2.desc': 'Describe what you need and get a ready‑to‑use 3D asset aligned to your brief.',
    'home.feature2.bullet1': 'Understands natural language',
    'home.feature2.bullet2': 'Style controls',
    'home.feature2.bullet3': 'Instant previews',
    'home.feature3.title': 'Production‑ready',
    'home.feature3.desc': 'Game, film, or archviz — export clean assets that drop straight into your pipeline.',
    'home.feature3.bullet1': 'High‑res meshes',
    'home.feature3.bullet2': 'PBR materials',
    'home.feature3.bullet3': 'OBJ/FBX/GLTF',
    'home.showcase.title': 'See what it can do',
    'home.showcase.subtitle': 'Real results from everyday prompts and references',
    'home.cta.title': 'Ready to build?',
    'home.cta.subtitle': 'Join thousands of creators speeding up 3D work with AI',
    'home.cta.freeTrial': 'Start for free',
    'home.cta.viewPricing': 'View Pricing',
    'home.footer.support': 'No credit card required • Cancel anytime • 24/7 support',
    'home.footer.company': 'Company',
    'home.footer.aboutUs': 'About us',
    'home.footer.careers': 'Careers',
    'home.footer.contact': 'Contact',
    'home.footer.helpCenter': 'Help center',
    'home.footer.community': 'Community',
    'home.footer.status': 'Status',
    'home.footer.rights': 'All rights reserved.',
    'home.testimonials.title': 'Loved by creators',
    'home.testimonials.subtitle': 'Teams and independents ship faster with AI3D Pro',
    'home.testimonials.quote1': 'It cuts prototyping from hours to minutes. Exactly what my workflow needed.',
    'home.testimonials.name1': 'Maya Thompson',
    'home.testimonials.role1': 'Senior 3D Artist, StudioX',
    'home.testimonials.quote2': 'Prompt → playable asset. I use it every week for indie game sprints.',
    'home.testimonials.name2': 'Alex Rivera',
    'home.testimonials.role2': 'Indie Game Developer',
    'home.testimonials.quote3': 'Great for quick concept models. The exports drop straight into Unreal.',
    'home.testimonials.name3': 'Priya Nair',
    'home.testimonials.role3': 'Technical Artist',
    
    // Pricing
    'pricing.title': 'Choose the Right',
    'pricing.title.highlight': 'Pricing Plan',
    'pricing.subtitle': 'From individual creators to enterprise teams, we offer flexible pricing plans to meet different needs',
    'pricing.monthly': 'Monthly',
    'pricing.yearly': 'Yearly',
    'pricing.save': 'Save 20%',
    'pricing.free.title': 'Free',
    'pricing.free.price': '$0',
    'pricing.free.period': 'Forever Free',
    'pricing.free.feature1': '10 generations per month',
    'pricing.free.feature2': 'Basic model quality',
    'pricing.free.feature3': 'Standard render speed',
    'pricing.free.feature4': 'Community support',
    'pricing.free.feature5': 'Basic export formats',
    'pricing.free.current': 'Current Plan',
    'pricing.pro.title': 'Pro',
    'pricing.pro.price': '$15',
    'pricing.pro.period': '/month',
    'pricing.pro.yearly': 'Yearly $12/month',
    'pricing.pro.feature1': '100 generations per month',
    'pricing.pro.feature2': 'High-quality models',
    'pricing.pro.feature3': 'Fast rendering',
    'pricing.pro.feature4': 'Priority support',
    'pricing.pro.feature5': 'All export formats',
    'pricing.pro.feature6': 'Commercial license',
    'pricing.pro.feature7': 'No watermark export',
    'pricing.pro.feature8': 'Batch processing',
    'pricing.pro.choose': 'Choose Pro',
    'pricing.compare.title': 'Feature Comparison',
    'pricing.compare.subtitle': 'Detailed comparison of features across plans',
    'pricing.faq.title': 'FAQ',
    'pricing.faq.subtitle': 'Learn more about pricing details',
    'pricing.faq.q1': 'Can I change or cancel my subscription anytime?',
    'pricing.faq.a1': 'Yes, you can upgrade, downgrade, or cancel your subscription anytime. Changes take effect immediately, and we will refund the remaining time proportionally.',
    'pricing.faq.q2': 'What are the limitations of the free plan?',
    'pricing.faq.a2': 'The free plan provides 10 generations per month with basic model quality and standard render speed. Generated models can be used for personal learning but not for commercial use.',
    'pricing.faq.q3': 'What payment methods are supported?',
    'pricing.faq.a3': 'We support major payment methods including credit cards, PayPal, and bank transfers for enterprise plans.',
    'pricing.faq.q4': 'Can generated models be used for commercial projects?',
    'pricing.faq.a4': 'Paid users (Pro and above) have commercial usage licenses for generated models. You can use them for game development, film production, architectural design, and other commercial projects.',
    'pricing.cta.title': 'Ready to build?',
    'pricing.cta.subtitle': 'Start free and create production‑ready 3D assets with AI',
    'pricing.cta.freeTrial': 'Start for free',
    'pricing.footer.support': 'No credit card required • Cancel anytime • 24/7 support',
    
    // Generator
    'generator.title': 'Create Your',
    'generator.title.highlight': '3D World',
    'generator.subtitle': 'Choose input method and let AI generate beautiful 3D models for you',
    'generator.input.title': 'Choose Input Method',
    'generator.input.text': 'Text Description',
    'generator.input.text.desc': 'Enter text description',
    'generator.input.image': 'Image Input',
    'generator.input.image.desc': 'Upload reference image',
    'generator.input.sketch': 'Hand Sketch',
    'generator.input.sketch.desc': 'Simple hand-drawn input',
    'generator.text.placeholder': 'Describe the 3D model you want to generate...\n\nFor example: A cute cartoon cat with orange fur, big green eyes, sitting on a cushion',
    'generator.text.characters': 'characters',
    'generator.text.random': 'Random Example',
    'generator.text.optimize': 'Optimize Description',
    'generator.image.upload': 'Click to upload or drag image here',
    'generator.image.support': 'Supports JPG, PNG, WEBP formats, max 10MB',
    'generator.sketch.draw': 'Click to start drawing',
    'generator.sketch.support': 'Supports mouse and stylus',
    'generator.settings.title': 'Generation Settings',
    'generator.settings.style': 'Model Style',
    'generator.settings.style.realistic': 'Realistic',
    'generator.settings.style.cartoon': 'Cartoon',
    'generator.settings.style.lowpoly': 'Low Poly',
    'generator.settings.style.cyberpunk': 'Cyberpunk',
    'generator.settings.style.retro': 'Retro',
    'generator.settings.quality': 'Detail Level',
    'generator.settings.quality.low': 'Low',
    'generator.settings.quality.medium': 'Medium',
    'generator.settings.quality.high': 'High',
    'generator.settings.format': 'Output Format',
    'generator.settings.format.obj': 'OBJ',
    'generator.settings.format.fbx': 'FBX',
    'generator.settings.format.gltf': 'GLTF',
    'generator.generate': 'Start Generation',
    'generator.generating': 'Generating...',
    'generator.preview.title': '3D Preview',
    'generator.preview.waiting': 'Waiting for generation',
    'generator.preview.waiting.desc': 'Enter content and click generate button',
    'generator.preview.generated': '3D model generated',
    'generator.preview.drag': 'Drag to rotate and view from different angles',
    'generator.info.title': 'Model Information',
    'generator.info.polygons': 'Polygons',
    'generator.info.vertices': 'Vertices',
    'generator.info.texture': 'Texture Resolution',
    'generator.info.size': 'File Size',
    'generator.download': 'Download Model',
    'generator.edit': 'Edit Model',
    'generator.share': 'Share Work',
    
    // Gallery
    'gallery.title': 'Explore AI-Generated',
    'gallery.title.highlight': '3D Art World',
    'gallery.subtitle': 'Discover beautiful 3D models shared by community creators, from architecture to characters, furniture to artworks',
    'gallery.search.placeholder': 'Search 3D models...',
    'gallery.category.all': 'All Categories',
    'gallery.category.architecture': 'Architecture',
    'gallery.category.character': 'Character',
    'gallery.category.furniture': 'Furniture',
    'gallery.category.vehicle': 'Vehicle',
    'gallery.category.animal': 'Animal',
    'gallery.search': 'Search',
    'gallery.featured.title': 'Featured This Week',
    'gallery.featured.subtitle': 'Most popular 3D models in the community',
    'gallery.model.by': 'by',
    'gallery.model.created': 'created',
    'gallery.model.polygons': 'Polygons',
    'gallery.model.texture': 'Texture Resolution',
    'gallery.model.format': 'File Format',
    'gallery.model.generationTime': 'Generation Time',
    'gallery.model.download': 'Download Model',
    'gallery.model.share': 'Share',
    'gallery.model.like': 'Like',
    'gallery.latest.title': 'Latest Works',
    'gallery.latest': 'Latest',
    'gallery.popular': 'Popular',
    'gallery.favorites': 'Favorites',
    'gallery.createModel': 'Create Model',
    'gallery.loadMore': 'Load More Models',
    
    // Common
    'common.and': 'and',
    'common.or': 'or',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.share': 'Share',
    'common.download': 'Download',
    'common.like': 'Like',
    'common.view': 'View',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.retry': 'Retry',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.finish': 'Finish',
    'common.continue': 'Continue',
    'common.skip': 'Skip',
    'common.ok': 'OK',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.on': 'On',
    'common.off': 'Off',
    'common.enabled': 'Enabled',
    'common.disabled': 'Disabled',
    'common.optional': 'Optional',
    'common.required': 'Required',
    'common.preview': 'Preview',
    'common.settings': 'Settings',
    'common.help': 'Help',
    'common.about': 'About',
    'common.contact': 'Contact Us',
    'common.privacy': 'Privacy Policy',
    'common.terms': 'Terms of Service',
    'common.copyright': 'Copyright'
  }
}

export function LanguageProvider({ children, initialLanguage = 'en' }: { children: ReactNode, initialLanguage?: Language }) {
  const [language, setLanguage] = useState<Language>(initialLanguage)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const savedLanguage = getSavedLanguage()
    if (savedLanguage !== language) {
      setIsLoading(true)
      setLanguage(savedLanguage)
      setIsLoading(false)
    }
  }, [])

  // 保存语言偏好到cookie和localStorage
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    
    try {
      // 保存到cookie（设置30天过期）
      const expires = new Date()
      expires.setDate(expires.getDate() + 30)
      document.cookie = `language=${lang}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
      
      // 保存到localStorage作为备选
      localStorage.setItem('language', lang)
    } catch (error) {
      console.warn('Failed to save language preference:', error)
    }
  }

  const t = (key: string): string => {
    const dict = translations[language] as Record<string, string>
    return dict[key] || key
  }

  // 使用CSS控制显示，避免闪烁
  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, isLoading }}>
      <div style={{ 
        opacity: isLoading ? 0 : 1,
        transition: 'opacity 0.1s ease-in-out'
      }}>
        {children}
      </div>
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}