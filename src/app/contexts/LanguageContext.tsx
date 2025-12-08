'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

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
  if (typeof window === 'undefined') return 'en'
  const browserLang = navigator.language || navigator.languages[0]
  return browserLang?.startsWith('zh') ? 'zh' : 'en'
}

// 从cookie或localStorage获取保存的语言
const getSavedLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en'
  
  try {
    // 优先使用cookie - 更高效的解析方式
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('language='))
      ?.split('=')[1]
      || document.cookie
      .split('; ')
      .find(row => row.startsWith('NEXT_LOCALE='))
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
  } catch {
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
    'nav.logout': '登出',
    'nav.startTrial': '免费开始',
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
    'home.features.step1.title': '输入',
    'home.features.step1.desc': '上传清晰图片或输入短文本提示，快速进入3D建模流程。',
    'home.features.step1.helper': '点击 / 拖拽 / 粘贴 图片',
    'home.features.step2.title': '生成',
    'home.features.step2.desc': '观感逼真，秒级完成高质量3D模型生成。',
    'home.features.step2.button': '生成',
    'home.features.step3.title': '下载',
    'home.features.step3.desc': '浏览器内预览模型，一键下载继续你的工作流程。',
    'home.features.step3.button': '下载',
    'home.features.speed.label': '创建速度',
    'home.features.speed.title': '瞬时3D模型创建，秒级完成',
    'home.features.speed.desc': '使用我们自研的高效3D重建工具，轻松将您的2D图像、电商图或插画转换为高拟真3D模型。',
    'home.features.speed.tag': '图像转3D模型',
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
    'home.showcase.title': '看看它能做什么',
    'home.showcase.subtitle': '来自日常提示和参考的真实效果',
    'home.showcase.card1.title': '风格化角色',
    'home.showcase.card1.desc': '提示词 → 可绑定骨骼的风格化角色，拓扑干净。',
    'home.showcase.card2.title': '现代家具套件',
    'home.showcase.card2.desc': '参考图 → 适用于室内场景的 PBR 材质模型。',
    'home.showcase.card3.title': '科幻无人机',
    'home.showcase.card3.desc': '文字描述 → 可用于游戏的资产，支持 GLTF 导出。',
    'home.cta.title': '准备好开始了吗？',
    'home.cta.subtitle': '加入数千名创作者的行列，用AI加速你的3D创作流程',
    'home.cta.freeTrial': '免费开始',
    'home.cta.viewPricing': '查看定价方案',
    'home.footer.support': '支持',
    'home.footer.company': '公司',
    'home.footer.aboutUs': '关于我们',
    'home.footer.careers': '加入我们',
    'home.footer.contact': '联系',
    'home.footer.helpCenter': '帮助中心',
    'home.footer.community': '社区',
    'home.footer.status': '系统状态',
    'home.footer.rights': '保留所有权利。',
    // 效果案例板块
    'home.portfolio.title': '精选案例展示',
    'home.portfolio.subtitle': '看看全球创作者使用imageto3d创作的惊艳作品',
    'home.portfolio.category.all': '全部',
    'home.portfolio.category.character': '角色设计',
    'home.portfolio.category.architecture': '建筑设计',
    'home.portfolio.category.product': '产品展示',
    'home.portfolio.category.art': '艺术创作',
    'home.portfolio.viewProject': '查看项目',
    'home.portfolio.case1.title': '奇幻角色设计',
    'home.portfolio.case1.category': '角色设计',
    'home.portfolio.case1.desc': '通过AI生成的奇幻风格角色，包含完整的纹理和骨骼绑定',
    'home.portfolio.case1.time': '生成时间: 45秒',
    'home.portfolio.case2.title': '现代建筑设计',
    'home.portfolio.case2.category': '建筑设计',
    'home.portfolio.case2.desc': '基于文字描述生成的现代商业建筑，可直接用于建筑可视化',
    'home.portfolio.case2.time': '生成时间: 2分钟',
    'home.portfolio.case3.title': '产品概念展示',
    'home.portfolio.case3.category': '产品展示',
    'home.portfolio.case3.desc': '智能耳机产品建模，适合产品发布会和营销材料',
    'home.portfolio.case3.time': '生成时间: 1分钟',
    'home.portfolio.case4.title': '抽象艺术雕塑',
    'home.portfolio.case4.category': '艺术创作',
    'home.portfolio.case4.desc': '结合现代艺术风格的抽象雕塑作品，适合数字艺术展览',
    'home.portfolio.case4.time': '生成时间: 30秒',
    'home.portfolio.case5.title': '机械战甲设计',
    'home.portfolio.case5.category': '角色设计',
    'home.portfolio.case5.desc': '科幻风格机械战甲，包含详细的结构设计和材质表现',
    'home.portfolio.case5.time': '生成时间: 3分钟',
    'home.portfolio.case6.title': '室内家具套装',
    'home.portfolio.case6.category': '产品展示',
    'home.portfolio.case6.desc': '北欧风格家具组合，适合室内设计和装饰项目',
    'home.portfolio.case6.time': '生成时间: 1.5分钟',

    // 用户评价板块
    'home.reviews.title': '用户真实评价',
    'home.reviews.subtitle': '来自全球创作者的使用体验分享',
    'home.reviews.avatars.alt': '用户头像',
    'home.reviews.user1.name': 'AXX_6688',
    'home.reviews.user1.role': '游戏开发者',
    'home.reviews.user1.rating': '5.0',
    'home.reviews.user1.comment': '作为独立游戏开发者，这个工具彻底改变了我的工作流程。原来需要几天才能完成的3D建模，现在几分钟就能搞定。生成的模型质量非常高，直接就能用到Unity里。',
    'home.reviews.user1.date': '2025年1月15日',
    'home.reviews.user2.name': 'wwu Wendy',
    'home.reviews.user2.role': '建筑设计师',
    'home.reviews.user2.rating': '4.8',
    'home.reviews.user2.comment': '客户沟通时能够实时生成3D概念图，大大提高了提案成功率。AI对建筑语言的理解很准确，生成的模型专业度很高。',
    'home.reviews.user2.date': '2025年1月12日',
    'home.reviews.user3.name': 'takechi',
    'home.reviews.user3.role': '产品设计总监',
    'home.reviews.user3.rating': '4.9',
    'home.reviews.user3.comment': '产品概念设计阶段的效率提升了10倍。我们可以在早期快速迭代多个设计方案，团队协作变得更加顺畅。特别是文本生成功能，想象力的限制被完全打破了。',
    'home.reviews.user3.date': '2025年1月10日',
    'home.reviews.user4.name': 'sebastian',
    'home.reviews.user4.role': '数字艺术家',
    'home.reviews.user4.rating': '5.0',
    'home.reviews.user4.comment': '创作自由度极高！我可以用简单的描述就能生成复杂的艺术作品。纹理质量和细节表现都超出了我的预期。这个工具让我能够更专注于创意本身。',
    'home.reviews.user4.date': '2025年1月8日',
    'home.reviews.user5.name': 'yummy',
    'home.reviews.user5.role': '教育工作者',
    'home.reviews.user5.rating': '4.7',
    'home.reviews.user5.comment': '在3D设计教学中使用这个工具，学生的学习兴趣大大提高。他们可以快速看到自己的想法变成现实，这种即时反馈对学习非常有帮助。',
    'home.reviews.user5.date': '2025年1月5日',
    'home.reviews.user6.name': 'anton',
    'home.reviews.user6.role': '影视特效师',
    'home.reviews.user6.rating': '4.8',
    'home.reviews.user6.comment': '在前期概念设计阶段非常实用，能够快速生成大量概念模型供导演选择。虽然有些细节还需要手动调整，但整体效率提升是显而易见的。',
    'home.reviews.user6.date': '2025年1月3日',
    'home.reviews.loadMore': '加载更多评价',
    'home.reviews.totalUsers': '+10,000',
    'home.reviews.averageRating': '4.8',
    'home.reviews.trustBadge': '真实用户评价',
    
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
    'pricing.cta.subtitle': '免费开始，体验AI驱动的3D模型生成',
    'pricing.cta.freeTrial': '免费开始',
    'pricing.cta.watchDemo': '观看演示',
    'pricing.footer.support': '',
    
    // 生成器页
    'generator.title': '创造你的',
    'generator.title.highlight': '3D世界',
    'generator.subtitle': '选择输入方式，让AI为你生成精美的3D模型',
    'generator.input.title': '选择输入方式',
    'generator.input.text': '文本描述',
    'generator.input.text.desc': '输入文字描述',
    'generator.input.image': '图片输入',
    'generator.input.image.desc': '上传参考图片',
    'generator.text.placeholder': '描述你想要生成的3D模型...\n\n例如：一只可爱的卡通猫咪，橘色毛发，绿色大眼睛，坐在垫子上',
    'generator.text.characters': '字符',
    'generator.text.random': '随机示例',
    'generator.text.optimize': '优化描述',
    'generator.image.upload': '点击上传或拖拽图片到此处',
    'generator.image.support': '支持 JPG、PNG、WEBP 格式，最大 10MB',
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
    'generator.actions.download': '下载模型',
    'generator.actions.downloadOriginal': '下载原图',
    'generator.actions.edit': '编辑模型',
    'generator.actions.share': '分享作品',
    'generator.export.title': '导出指定格式',
    'generator.footer.description': '使用 AI 生成你的 3D 模型，文本或图片均可',
    'generator.footer.generationMethods': '生成方式',
    'generator.footer.textGeneration': '文本生成',
    'generator.footer.imageTo3d': '图片转3D',
    'generator.footer.tools': '工具',
    'generator.footer.modelEditor': '模型编辑器',
    'generator.footer.materialLibrary': '材质库',
    'generator.footer.exportSettings': '导出设置',
    'generator.footer.help': '帮助',
    'generator.footer.userGuide': '用户指南',
    'generator.footer.apiDocs': 'API 文档',
    'generator.footer.techSupport': '技术支持',
    'generator.footer.rights': '保留所有权利。',
    'generator.studio.title': '3D 创作工作台',
    'generator.studio.subtitle': 'AI 生成 • 导入与编辑',
    'generator.engine.title': '选择生成引擎',
    'generator.tabs.generate': 'AI 生成',
    'generator.tabs.import': '导入模型',
    'generator.model.typeLabel': '类型',
    'generator.model.type.textToImage': '文本生成图像',
    'generator.model.type.imageEdit': '图像编辑',
    'generator.model.type.imageTo3d': '图片转 3D 模型',
    'generator.warn.nanoBananaTextOnly': '⚠️ Nano Banana Pro 仅支持文本生成，请选择文本模式',
    
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
    'gallery.preview.title': '模型预览',
    'gallery.preview.controls': '拖拽旋转，滚轮缩放',
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
    'gallery.grid.loadMore': '加载更多',
    'gallery.footer.description': '发现、分享、下载由AI生成的3D模型作品',
    'gallery.footer.browse': '浏览',
    'gallery.footer.latest': '最新',
    'gallery.footer.popular': '热门',
    'gallery.footer.editorPicks': '编辑精选',
    'gallery.footer.community': '社区',
    'gallery.footer.creators': '创作者',
    'gallery.footer.challenges': '挑战赛',
    'gallery.footer.tutorials': '教程',
    'gallery.footer.support': '支持',
    'gallery.footer.helpCenter': '帮助中心',
    'gallery.footer.apiDocs': 'API 文档',
    'gallery.footer.contact': '联系我们',
    'gallery.footer.rights': '保留所有权利。',
    
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
    'common.copyright': '版权所有',

    // Terms of Service Page
    'terms.title': '服务条款',
    'terms.subtitle': '请仔细阅读以下服务条款',
    'terms.lastUpdated': '最后更新：2025年1月',
    'terms.intro': '欢迎使用imageto3d！以下服务条款（"条款"）规定了您使用我们AI驱动的3D模型生成服务的条款和条件。',
    'terms.acceptance': '通过访问或使用我们的服务，您确认您已阅读、理解并同意受本条款约束。',
    'terms.tableOfContents': '目录',

    // Terms sections
    'terms.section1.title': '1. 服务描述',
    'terms.section1.content': 'imageto3d是一个基于人工智能的3D模型生成平台，允许用户：\n• 通过文本描述生成3D模型\n• 上传图片转换为3D模型\n• 编辑和优化生成的3D模型\n• 下载和使用生成的模型文件\n• 分享和协作功能',

    'terms.section2.title': '2. 用户账户',
    'terms.section2.content': '账户注册：您需要创建账户才能使用我们的服务。您提供的所有信息必须真实、准确和完整。\n账户安全：您负责保护账户密码的安全性，并对您账户下的所有活动承担责任。\n账户终止：我们保留在违反条款的情况下暂停或终止您账户的权利。',

    'terms.section3.title': '3. 使用许可',
    'terms.section3.content': '免费用户：生成的模型可个人学习和非商业用途。\n付费用户：获得商业使用许可证，可将模型用于商业项目。\n内容所有权：您对生成的内容拥有所有权，但我们保留在服务中使用匿名的模型进行展示和推广的权利。',

    'terms.section4.title': '4. 用户行为准则',
    'terms4.content': '禁止行为：\n• 生成违法、有害、威胁性、辱骂性或侵权内容\n• 违反适用的法律法规\n• 侵犯他人的知识产权\n• 干扰或破坏服务的正常运行\n• 使用服务进行欺诈或恶意活动',

    'terms.section5.title': '5. 知识产权',
    'terms.section5.content': '平台权利：imageto3d及其所有内容、功能和服务均受知识产权法律保护。\n用户内容：您保留对生成内容的所有权，但授予我们使用、修改和展示的权利。\n反馈：我们欢迎用户反馈，您提供的反馈可能被用于改进服务。',

    'terms.section6.title': '6. 付费与退款',
    'terms.section6.content': '定价：服务采用订阅制，价格可能随时调整，调整前会通知用户。\n支付：我们支持多种支付方式，包括信用卡、支付宝、微信支付等。\n退款：根据我们的退款政策，未使用的订阅期可能获得部分退款。',

    'terms.section7.title': '7. 免责声明',
    'terms.section7.content': '服务按"现状"提供，不提供任何明示或暗示的保证。\n准确性：我们不保证AI生成结果的准确性或适用性。\n可用性：服务可能因维护、更新或其他原因暂时中断。\n损失责任：我们对因使用服务而产生的任何间接、偶然、特殊或后果性损害不承担责任。',

    'terms.section8.title': '8. 服务变更与终止',
    'terms.section8.content': '服务变更：我们保留随时修改或终止服务的权利，重要变更会提前通知用户。\n账户终止：用户可随时删除账户，删除后相关数据可能无法恢复。\n条款更新：我们会定期更新这些条款，继续使用服务即表示接受新条款。',

    'terms.section9.title': '9. 争议解决',
    'terms.section9.content': '适用法律：本条款受中华人民共和国法律管辖。\n争议解决：任何争议应通过友好协商解决，协商不成可向有管辖权的法院提起诉讼。\n管辖权：争议管辖法院为服务提供方所在地人民法院。',

    'terms.section10.title': '10. 联系我们',
    'terms.section10.content': '如有任何问题或疑虑，请通过以下方式联系我们：\n• 邮箱：support@ai3dpro.com\n• 电话：+86 123 4567 8900\n• 地址：中国上海市浦东新区XX路XX号',

    // Privacy Policy Page
    'privacy.title': '隐私政策',
    'privacy.subtitle': '您的隐私对我们很重要',
    'privacy.lastUpdated': '最后更新：2025年1月',
    'privacy.intro': 'imageto3d（"我们"、"公司"或"服务"）致力于保护您的隐私。本隐私政策说明了我们如何收集、使用、存储和保护您的个人信息。',
    'privacy.acceptance': '使用我们的服务即表示您同意本政策中描述的做法。',
    'privacy.tableOfContents': '目录',

    // Privacy sections
    'privacy.section1.title': '1. 我们收集的信息',
    'privacy.section1.content': '账户信息：包括您的姓名、电子邮件地址、密码、联系方式等。\n使用信息：包括您如何使用服务、生成历史记录、偏好设置等。\n技术信息：包括IP地址、浏览器类型、设备信息、访问时间等。\n支付信息：如果您使用付费服务，我们会收集相关的支付信息。',

    'privacy.section2.title': '2. 信息使用方式',
    'privacy.section2.content': '服务提供：提供、运营、维护和改进我们的AI3D生成服务。\n个性化：根据您的使用习惯提供个性化的用户体验。\n沟通：通过电子邮件、短信等方式与您沟通。\n分析：分析服务使用情况以改进我们的产品和服务。\n安全：监控和防范滥用、欺诈等安全威胁。',

    'privacy.section3.title': '3. 信息共享',
    'privacy.section3.content': '我们不会向第三方出售、交易或转移您的个人信息，除非：\n• 获得您的明确同意\n• 法律要求或法院命令\n• 为了保护我们的权利、财产或安全\n• 与可信服务提供商共享（仅限于提供服务所需）\n• 在合并、收购或资产转让的情况下',

    'privacy.section4.title': '4. 数据安全',
    'privacy.section4.content': '安全措施：我们采用行业标准的安全措施保护您的信息。\n数据加密：敏感数据在传输和存储过程中进行加密。\n访问控制：仅授权人员才能访问您的个人信息。\n定期审查：我们定期审查安全措施的有效性。',

    'privacy.section5.title': '5. Cookie使用',
    'privacy.section5.content': 'Cookie类型：我们使用必要Cookie、性能Cookie和营销Cookie。\n用途：Cookie用于记住您的偏好、分析网站流量和个性化广告。\n管理：您可以通过浏览器设置管理Cookie偏好。\n第三方：我们可能使用第三方分析服务，这些服务可能有自己的Cookie政策。',

    'privacy.section6.title': '6. 数据保留',
    'privacy.section6.content': '保留期限：我们仅在必要期间保留您的个人信息。\n删除请求：您有权要求删除您的个人信息，我们将根据法律要求处理。\n匿名化：不再需要的信息将被匿名化处理。',

    'privacy.section7.title': '7. 您的权利',
    'privacy.section7.content': '访问权：您有权访问我们持有的关于您的个人信息。\n• 更正权：您可以更正不准确的信息。\n• 删除权：在特定情况下，您可以要求删除您的信息。\n• 限制处理权：您可以限制我们处理您的信息。\n• 数据可携带权：您可以以结构化格式获取您的数据。',

    'privacy.section8.title': '8. 第三方服务',
    'privacy8.content': '我们的服务可能包含指向第三方网站或服务的链接。这些第三方有自己的隐私政策，我们不对其做法负责。\n建议您在使用第三方服务前阅读其隐私政策。',

    'privacy.section9.title': '9. 儿童隐私',
    'privacy.section9.content': '年龄限制：我们的服务不面向13岁以下的儿童。\n• 如果我们发现收集了13岁以下儿童的个人信息，我们将采取步骤删除这些信息。\n• 如果您认为我们可能收集了儿童信息，请立即联系我们。',

    'privacy.section10.title': '10. 政策更新',
    'privacy.section10.content': '更新频率：我们可能会不时更新本隐私政策。\n• 重要变更：当有重大变更时，我们会通过网站或电子邮件通知您。\n• 生效时间：更新后的政策将在发布后立即生效。',

    'privacy.section11.title': '11. 联系我们',
    'privacy.section11.content': '如果您对本隐私政策有任何疑问或疑虑，请通过以下方式联系我们：\n• 邮箱：privacy@ai3dpro.com\n• 电话：+86 123 4567 8901\n• 地址：中国上海市浦东新区XX路XX号',

    // Common footer links
    'terms.viewFull': '查看完整条款',
    'privacy.viewFull': '查看完整政策',
    'legal.creamPayment': 'Cream支付服务条款',

    'help.title': '帮助中心',
    'help.subtitle': '常见问题、快速入门与支持',
    'help.searchPlaceholder': '搜索问题或关键词...',
    'help.section.gettingStarted.title': '快速入门',
    'help.section.gettingStarted.items.imageTo3D': '图片转3D：上传清晰参考图，选择质量与格式',
    'help.section.gettingStarted.items.textTo3D': '文本转3D：输入提示词，设置风格与参数',
    'help.section.gettingStarted.items.export': '导出与下载：GLTF/GLB、OBJ、FBX',
    'help.section.faq.title': '常见问题',
    'help.faq.q1': '如何提升生成质量？',
    'help.faq.a1': '使用更清晰参考图，补充材质与风格关键词，适当提高质量参数。',
    'help.faq.q2': '支持哪些格式导出？',
    'help.faq.a2': '支持 GLTF/GLB、OBJ、FBX 等常用格式。',
    'help.faq.q3': '生成的模型可以商用吗？',
    'help.faq.a3': '付费方案包含商用许可，详情见定价与条款。',
    'help.section.contact.title': '联系我们',
    'help.contact.support': '客服支持',
    'help.contact.email': '邮箱',
    'help.contact.status': '系统状态',
    'help.cta.title': '准备好开始了吗？',
    'help.cta.subtitle': '加入数千名创作者，用AI加速你的3D创作流程',
    'help.cta.start': '开始创建模型',
    'help.cta.viewPricing': '查看定价方案',

    'comments.title': '用户评论',
    'comments.addPlaceholder': '写下你的看法...',
    'comments.submit': '发送',
    'comments.empty': '暂无评论'
  },
  en: {
    // Navigation
    'nav.product': 'Product',
    'nav.pricing': 'Pricing',
    'nav.api': 'API',
    'nav.help': 'Help',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
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
    'home.features.step1.title': 'Input',
    'home.features.step1.desc': 'Upload a clear image or enter a short text prompt to quickly start the 3D modeling workflow.',
    'home.features.step1.helper': 'Click / Drag & Drop / Paste Image',
    'home.features.step2.title': 'Generate',
    'home.features.step2.desc': 'Realistic results — generate high‑quality 3D models in seconds.',
    'home.features.step2.button': 'Generate',
    'home.features.step3.title': 'Download',
    'home.features.step3.desc': 'Preview in browser and download with one click to continue your workflow.',
    'home.features.step3.button': 'Download',
    'home.features.speed.label': 'Creation Speed',
    'home.features.speed.title': 'Instant 3D model creation, finished in seconds',
    'home.features.speed.desc': 'With our in‑house 3D reconstruction, easily convert your 2D images, product shots, or illustrations into highly realistic 3D models.',
    'home.features.speed.tag': 'Image to 3D Model',
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
    'home.showcase.card1.title': 'Stylized character',
    'home.showcase.card1.desc': 'Prompt → rig‑ready stylized avatar with clean topology.',
    'home.showcase.card2.title': 'Modern furniture set',
    'home.showcase.card2.desc': 'Reference image → PBR‑ready models for interior scenes.',
    'home.showcase.card3.title': 'Sci‑fi drone',
    'home.showcase.card3.desc': 'Text brief → game‑ready asset with GLTF export.',
    'home.cta.title': 'Ready to build?',
    'home.cta.subtitle': 'Join thousands of creators speeding up 3D work with AI',
    'home.cta.freeTrial': 'Start for free',
    'home.cta.viewPricing': 'View Pricing',
    'home.footer.support': 'Support',
    'home.footer.company': 'Company',
    'home.footer.aboutUs': 'About us',
    'home.footer.careers': 'Careers',
    'home.footer.contact': 'Contact',
    'home.footer.helpCenter': 'Help center',
    'home.footer.community': 'Community',
    'home.footer.status': 'Status',
    'home.footer.rights': 'All rights reserved.',
    // Portfolio Section
    'home.portfolio.title': 'Featured Portfolio',
    'home.portfolio.subtitle': 'Explore amazing creations from global creators using imageto3d',
    'home.portfolio.category.all': 'All',
    'home.portfolio.category.character': 'Character Design',
    'home.portfolio.category.architecture': 'Architecture',
    'home.portfolio.category.product': 'Product Design',
    'home.portfolio.category.art': 'Digital Art',
    'home.portfolio.viewProject': 'View Project',
    'home.portfolio.case1.title': 'Fantasy Character Design',
    'home.portfolio.case1.category': 'Character Design',
    'home.portfolio.case1.desc': 'AI-generated fantasy-style character with complete textures and rigging',
    'home.portfolio.case1.time': 'Generation time: 45s',
    'home.portfolio.case2.title': 'Modern Architecture',
    'home.portfolio.case2.category': 'Architecture',
    'home.portfolio.case2.desc': 'Modern commercial building generated from text description, ready for architectural visualization',
    'home.portfolio.case2.time': 'Generation time: 2min',
    'home.portfolio.case3.title': 'Product Concept',
    'home.portfolio.case3.category': 'Product Design',
    'home.portfolio.case3.desc': 'Smart headphone product modeling, perfect for product launches and marketing materials',
    'home.portfolio.case3.time': 'Generation time: 1min',
    'home.portfolio.case4.title': 'Abstract Art Sculpture',
    'home.portfolio.case4.category': 'Digital Art',
    'home.portfolio.case4.desc': 'Abstract sculpture combining modern artistic styles, suitable for digital art exhibitions',
    'home.portfolio.case4.time': 'Generation time: 30s',
    'home.portfolio.case5.title': 'Mechanical Armor Design',
    'home.portfolio.case5.category': 'Character Design',
    'home.portfolio.case5.desc': 'Sci-fi style mechanical armor with detailed structural design and material representation',
    'home.portfolio.case5.time': 'Generation time: 3min',
    'home.portfolio.case6.title': 'Furniture Set',
    'home.portfolio.case6.category': 'Product Design',
    'home.portfolio.case6.desc': 'Nordic-style furniture combination, suitable for interior design and decoration projects',
    'home.portfolio.case6.time': 'Generation time: 1.5min',

    // User Reviews Section
    'home.reviews.title': 'Real User Reviews',
    'home.reviews.subtitle': 'Experience sharing from creators worldwide',
    'home.reviews.avatars.alt': 'User Avatar',
    'home.reviews.user1.name': 'AXX_6688',
    'home.reviews.user1.role': 'Game Developer',
    'home.reviews.user1.rating': '5.0',
    'home.reviews.user1.comment': 'As an indie game developer, this tool completely changed my workflow. What used to take days to complete in 3D modeling now takes minutes. The generated models are high quality and can be used directly in Unity.',
    'home.reviews.user1.date': 'Jan 15, 2025',
    'home.reviews.user2.name': 'wwu Wendy',
    'home.reviews.user2.role': 'Architectural Designer',
    'home.reviews.user2.rating': '4.8',
    'home.reviews.user2.comment': 'Being able to generate 3D concept drawings in real-time during client communication greatly improved proposal success rates. AI understands architectural language very accurately, and the generated models are highly professional.',
    'home.reviews.user2.date': 'Jan 12, 2025',
    'home.reviews.user3.name': 'takechi',
    'home.reviews.user3.role': 'Product Design Director',
    'home.reviews.user3.rating': '4.9',
    'home.reviews.user3.comment': 'Product concept design phase efficiency increased 10-fold. We can quickly iterate multiple design solutions in early stages, making team collaboration much smoother. Especially the text generation function completely breaks the limits of imagination.',
    'home.reviews.user3.date': 'Jan 10, 2025',
    'home.reviews.user4.name': 'sebastian',
    'home.reviews.user4.role': 'Digital Artist',
    'home.reviews.user4.rating': '5.0',
    'home.reviews.user4.comment': 'Extremely high creative freedom! I can generate complex artworks with simple descriptions. Texture quality and detail representation exceeded my expectations. This tool lets me focus more on creativity itself.',
    'home.reviews.user4.date': 'Jan 8, 2025',
    'home.reviews.user5.name': 'yummy',
    'home.reviews.user5.role': 'Educator',
    'home.reviews.user5.rating': '4.7',
    'home.reviews.user5.comment': 'Using this tool in 3D design teaching greatly increased student interest. They can quickly see their ideas become reality, and this immediate feedback is very helpful for learning.',
    'home.reviews.user5.date': 'Jan 5, 2025',
    'home.reviews.user6.name': 'anton',
    'home.reviews.user6.role': 'VFX Artist',
    'home.reviews.user6.rating': '4.8',
    'home.reviews.user6.comment': 'Very practical in early concept design stages, able to quickly generate大量概念模型供导演选择. Although some details still need manual adjustment, the overall efficiency improvement is obvious.',
    'home.reviews.user6.date': 'Jan 3, 2025',
    'home.reviews.loadMore': 'Load More Reviews',
    'home.reviews.totalUsers': '+10,000',
    'home.reviews.averageRating': '4.8',
    'home.reviews.trustBadge': 'Real User Reviews',
    
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
    'pricing.footer.support': '',
    
    // Generator
    'generator.title': 'Create Your',
    'generator.title.highlight': '3D World',
    'generator.subtitle': 'Choose input method and let AI generate beautiful 3D models for you',
    'generator.input.title': 'Choose Input Method',
    'generator.input.text': 'Text Description',
    'generator.input.text.desc': 'Enter text description',
    'generator.input.image': 'Image Input',
    'generator.input.image.desc': 'Upload reference image',
    'generator.text.placeholder': 'Describe the 3D model you want to generate...\n\nFor example: A cute cartoon cat with orange fur, big green eyes, sitting on a cushion',
    'generator.text.characters': 'characters',
    'generator.text.random': 'Random Example',
    'generator.text.optimize': 'Optimize Description',
    'generator.image.upload': 'Click to upload or drag image here',
    'generator.image.support': 'Supports JPG, PNG, WEBP formats, max 10MB',
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
    'generator.actions.download': 'Download Model',
    'generator.actions.downloadOriginal': 'Download Original',
    'generator.actions.edit': 'Edit Model',
    'generator.actions.share': 'Share Work',
    'generator.export.title': 'Export Formats',
    'generator.footer.description': 'Create 3D models with AI from text or images',
    'generator.footer.generationMethods': 'Generation Methods',
    'generator.footer.textGeneration': 'Text Generation',
    'generator.footer.imageTo3d': 'Image to 3D',
    'generator.footer.tools': 'Tools',
    'generator.footer.modelEditor': 'Model Editor',
    'generator.footer.materialLibrary': 'Material Library',
    'generator.footer.exportSettings': 'Export Settings',
    'generator.footer.help': 'Help',
    'generator.footer.userGuide': 'User Guide',
    'generator.footer.apiDocs': 'API Docs',
    'generator.footer.techSupport': 'Technical Support',
    'generator.footer.rights': 'All rights reserved.',
    'generator.studio.title': '3D Studio',
    'generator.studio.subtitle': 'AI Generate • Import & Edit',
    'generator.engine.title': 'Select Generation Engine',
    'generator.tabs.generate': 'AI Generate',
    'generator.tabs.import': 'Import Models',
    'generator.model.typeLabel': 'Type',
    'generator.model.type.textToImage': 'Text to Image',
    'generator.model.type.imageEdit': 'Image Edit',
    'generator.model.type.imageTo3d': 'Image to 3D Model',
    'generator.warn.nanoBananaTextOnly': 'Nano Banana Pro supports text-generation only. Please select Text mode.',
    
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
    'gallery.preview.title': 'Preview',
    'gallery.preview.controls': 'Drag to rotate, scroll to zoom',
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
    'gallery.grid.loadMore': 'Load More',
    'gallery.footer.description': 'Discover, share, and download AI‑generated 3D models',
    'gallery.footer.browse': 'Browse',
    'gallery.footer.latest': 'Latest',
    'gallery.footer.popular': 'Popular',
    'gallery.footer.editorPicks': 'Editor’s Picks',
    'gallery.footer.community': 'Community',
    'gallery.footer.creators': 'Creators',
    'gallery.footer.challenges': 'Challenges',
    'gallery.footer.tutorials': 'Tutorials',
    'gallery.footer.support': 'Support',
    'gallery.footer.helpCenter': 'Help Center',
    'gallery.footer.apiDocs': 'API Docs',
    'gallery.footer.contact': 'Contact',
    'gallery.footer.rights': 'All rights reserved.',
    
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
    'common.copyright': 'All rights reserved.',

    // Terms of Service Page
    'terms.title': 'Terms of Service',
    'terms.subtitle': 'Please read these terms of service carefully',
    'terms.lastUpdated': 'Last Updated: January 2025',
    'terms.intro': 'Welcome to imageto3d! These Terms of Service ("Terms") govern your use of our AI-powered 3D model generation service.',
    'terms.acceptance': 'By accessing or using our service, you acknowledge that you have read, understood, and agree to be bound by these Terms.',
    'terms.tableOfContents': 'Table of Contents',

    // Terms sections
    'terms.section1.title': '1. Service Description',
    'terms.section1.content': 'imageto3d is an AI-powered 3D model generation platform that allows users to:\n• Generate 3D models from text descriptions\n• Upload images and convert them to 3D models\n• Edit and optimize generated 3D models\n• Download and use generated model files\n• Share and collaborate features',

    'terms.section2.title': '2. User Accounts',
    'terms.section2.content': 'Account Registration: You must create an account to use our services. All information you provide must be true, accurate, and complete.\nAccount Security: You are responsible for safeguarding your account password and for all activities that occur under your account.\nAccount Termination: We reserve the right to suspend or terminate your account for violation of these Terms.',

    'terms.section3.title': '3. Usage License',
    'terms.section3.content': 'Free Users: Generated models may be used for personal learning and non-commercial purposes.\nPaid Users: Receive commercial use licenses for models used in commercial projects.\nContent Ownership: You own the content you generate, but we reserve the right to use anonymous models in our service for display and promotional purposes.',

    'terms.section4.title': '4. User Conduct',
    'terms4.content': 'Prohibited Activities:\n• Generate illegal, harmful, threatening, abusive, or infringing content\n• Violate applicable laws and regulations\n• Infringe on others intellectual property rights\n• Interfere with or disrupt the normal operation of the service\n• Use the service for fraudulent or malicious activities',

    'terms.section5.title': '5. Intellectual Property',
    'terms.section5.content': 'Platform Rights: imageto3d and all its content, features, and functionality are protected by intellectual property laws.\nUser Content: You retain ownership of the content you generate, but grant us the right to use, modify, and display it.\nFeedback: We welcome user feedback, and feedback you provide may be used to improve our services.',

    'terms.section6.title': '6. Payments and Refunds',
    'terms.section6.content': 'Pricing: Services are offered on a subscription basis, and prices may change at any time with prior notice.\nPayment: We support multiple payment methods, including credit cards, Alipay, WeChat Pay, and others.\nRefunds: Partial refunds may be available for unused subscription periods according to our refund policy.',

    'terms.section7.title': '7. Disclaimer of Warranties',
    'terms.section7.content': 'Service Availability: The service is provided "as is" without any express or implied warranties.\nAccuracy: We do not guarantee the accuracy or suitability of AI-generated results.\nAvailability: The service may be temporarily interrupted for maintenance, updates, or other reasons.\nLimitation of Liability: We are not liable for any indirect, incidental, special, or consequential damages arising from your use of the service.',

    'terms.section8.title': '8. Service Changes and Termination',
    'terms8.content': 'Service Changes: We reserve the right to modify or terminate the service at any time, with important changes communicated in advance.\nAccount Termination: You may delete your account at any time; upon deletion, related data may not be recoverable.\nTerms Updates: We periodically update these Terms; continued use of the service indicates acceptance of the new Terms.',

    'terms.section9.title': '9. Dispute Resolution',
    'terms.section9.content': 'Governing Law: These Terms are governed by the laws of the Peoples Republic of China.\nDispute Resolution: Any disputes should be resolved through friendly negotiation; if negotiation fails, they may be brought to a competent court.\nJurisdiction: The jurisdiction for disputes shall be the Peoples Court where the service provider is located.',

    'terms.section10.title': '10. Contact Us',
    'terms.section10.content': 'If you have any questions or concerns, please contact us:\n• Email: support@ai3dpro.com\n• Phone: +86 123 4567 8900\n• Address: XX Road XX, Pudong New Area, Shanghai, China',

    // Privacy Policy Page
    'privacy.title': 'Privacy Policy',
    'privacy.subtitle': 'Your privacy is important to us',
    'privacy.lastUpdated': 'Last Updated: January 2025',
    'privacy.intro': 'imageto3d ("we", "company", or "service") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information.',
    'privacy.acceptance': 'Your use of our service indicates your agreement to the practices described in this policy.',
    'privacy.tableOfContents': 'Table of Contents',

    // Privacy sections
    'privacy.section1.title': '1. Information We Collect',
    'privacy.section1.content': 'Account Information: Includes your name, email address, password, contact details, etc.\nUsage Information: Includes how you use the service, generation history, preferences, etc.\nTechnical Information: Includes IP address, browser type, device information, access times, etc.\nPayment Information: If you use paid services, we collect related payment information.',

    'privacy.section2.title': '2. How We Use Your Information',
    'privacy.section2.content': 'Service Provision: To provide, operate, maintain, and improve our AI3D generation service.\nPersonalization: To provide personalized user experiences based on your usage habits.\nCommunication: To communicate with you via email, SMS, etc.\nAnalytics: To analyze service usage patterns to improve our products and services.\nSecurity: To monitor and prevent abuse, fraud, and other security threats.',

    'privacy.section3.title': '3. Information Sharing',
    'privacy.section3.content': 'We do not sell, trade, or transfer your personal information to third parties, except:\n• With your explicit consent\n• When required by law or court order\n• To protect our rights, property, or safety\n• With trusted service providers (limited to service provision needs)\n• In case of merger, acquisition, or asset transfer',

    'privacy.section4.title': '4. Data Security',
    'privacy.section4.content': 'Security Measures: We implement industry-standard security measures to protect your information.\nData Encryption: Sensitive data is encrypted during transmission and storage.\nAccess Control: Only authorized personnel have access to your personal information.\nRegular Audits: We regularly review the effectiveness of our security measures.',

    'privacy.section5.title': '5. Cookie Usage',
    'privacy.section5.content': 'Cookie Types: We use essential, performance, and marketing cookies.\nPurpose: Cookies are used to remember your preferences, analyze website traffic, and personalize advertisements.\nManagement: You can manage your cookie preferences through browser settings.\nThird Party: We may use third-party analytics services that may have their own cookie policies.',

    'privacy.section6.title': '6. Data Retention',
    'privacy.section6.content': 'Retention Period: We retain your personal information only as long as necessary.\nDeletion Requests: You have the right to request deletion of your personal information; we will process according to legal requirements.\nAnonymization: Information no longer needed will be anonymized.',

    'privacy.section7.title': '7. Your Rights',
    'privacy7.content': 'Access Right: You have the right to access personal information we hold about you.\n• Correction Right: You can correct inaccurate information.\n• Deletion Right: In certain circumstances, you can request deletion of your information.\n• Restriction Right: You can restrict our processing of your information.\n• Data Portability Right: You can obtain your data in a structured format.',

    'privacy.section8.title': '8. Third-Party Services',
    'privacy8.content': 'Our service may contain links to third-party websites or services. These third parties have their own privacy policies, and we are not responsible for their practices.\nWe recommend reading their privacy policies before using third-party services.',

    'privacy.section9.title': '9. Childrens Privacy',
    'privacy.section9.content': 'Age Restrictions: Our service is not intended for children under 13 years of age.\n• If we discover that we have collected personal information from children under 13, we will take steps to delete this information.\n• If you believe we may have collected information from children, please contact us immediately.',

    'privacy.section10.title': '10. Policy Updates',
    'privacy.section10.content': 'Update Frequency: We may update this privacy policy from time to time.\n• Significant Changes: When we make significant changes, we will notify you via our website or email.\n• Effective Date: Updated policies take effect immediately upon posting.',

    'privacy.section11.title': '11. Contact Us',
    'privacy.section11.content': 'If you have any questions or concerns about this privacy policy, please contact us:\n• Email: privacy@ai3dpro.com\n• Phone: +86 123 4567 8901\n• Address: XX Road XX, Pudong New Area, Shanghai, China',

    // Common footer links
    'terms.viewFull': 'View Full Terms',
    'privacy.viewFull': 'View Full Policy',
    'legal.creamPayment': 'Cream Payment Terms',

    'help.title': 'Help Center',
    'help.subtitle': 'FAQs, getting started, and support',
    'help.searchPlaceholder': 'Search questions or keywords...',
    'help.section.gettingStarted.title': 'Getting Started',
    'help.section.gettingStarted.items.imageTo3D': 'Image to 3D: upload a clear reference, pick quality and format',
    'help.section.gettingStarted.items.textTo3D': 'Text to 3D: enter prompts, set style and parameters',
    'help.section.gettingStarted.items.export': 'Export & download: GLTF/GLB, OBJ, FBX',
    'help.section.faq.title': 'Frequently Asked Questions',
    'help.faq.q1': 'How to improve generation quality?',
    'help.faq.a1': 'Use clearer references, add material/style keywords, and raise quality settings.',
    'help.faq.q2': 'Which export formats are supported?',
    'help.faq.a2': 'GLTF/GLB, OBJ, and FBX are supported.',
    'help.faq.q3': 'Is commercial use allowed?',
    'help.faq.a3': 'Paid plans include commercial licensing; see pricing and terms.',
    'help.section.contact.title': 'Contact Us',
    'help.contact.support': 'Support',
    'help.contact.email': 'Email',
    'help.contact.status': 'System Status',
    'help.cta.title': 'Ready to start?',
    'help.cta.subtitle': 'Join thousands of creators and accelerate your 3D workflow with AI',
    'help.cta.start': 'Start creating',
    'help.cta.viewPricing': 'View pricing',

    'comments.title': 'Comments',
    'comments.addPlaceholder': 'Write a comment...',
    'comments.submit': 'Send',
    'comments.empty': 'No comments yet'
  }
}

export function LanguageProvider({ children, initialLanguage = 'en' }: { children: ReactNode, initialLanguage?: Language }) {
  const [language, setLanguage] = useState<Language>(typeof window === 'undefined' ? initialLanguage : getSavedLanguage())
  const [isLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = language
      }
    } catch {}
  }, [language])

  useEffect(() => {
    try {
      const m = pathname?.match(/^\/(zh|en)(?=\/|$)/)
      const pLang = (m?.[1] as Language | undefined) || null
      if (pLang && pLang !== language) {
        handleSetLanguage(pLang)
      }
    } catch {}
  }, [pathname])

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
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang
      }
    } catch {}
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
