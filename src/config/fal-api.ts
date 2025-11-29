// FAL-AI API 参数配置 - 基于实际API文档
export interface FalApiConfig {
  // 通用参数
  model_id?: string
  seed?: number | null
  sync_mode?: boolean

  // Nano Banana Pro (文本转图像) 参数
  prompt?: string
  num_inference_steps?: number
  guidance_scale?: number
  width?: number
  height?: number
  negative_prompt?: string
  num_images?: number

  // Nano Banana Pro Edit (图像编辑) 参数
  image_url?: string  // 用于图像编辑
  num_inference_steps?: number
  guidance_scale?: number
  width?: number
  height?: number
  negative_prompt?: string
  strength?: number  // 编辑强度

  // Trellis (3D模型生成) 参数
  scale?: number  // 3D模型缩放
  num_samples?: number  // 生成样本数量
  output_format?: 'glb' | 'obj' | 'gltf' | 'ply'
  simplify?: boolean  // 简化模型
  texture_size?: number  // 纹理大小
  max_faces?: number  // 最大面数
}

// 不同API服务的参数映射
export const FAL_APIS = {
  // 文本转图像模型
  'fal-ai/nano-banana-pro': {
    name: 'Nano Banana Pro',
    type: 'text-to-image',
    description: '文本生成高质量图像',
    default_params: {
      num_inference_steps: 20,
      guidance_scale: 7.5,
      sync_mode: false,
      width: 1024,
      height: 1024,
      num_images: 1
    },
    // 实际支持的参数
    supported_params: ['prompt', 'seed', 'sync_mode', 'num_inference_steps', 'guidance_scale', 'width', 'height', 'negative_prompt', 'num_images']
  },

  // 图像编辑模型
  'fal-ai/nano-banana-pro/edit': {
    name: 'Nano Banana Pro Edit',
    type: 'image-edit',
    description: '图像编辑和增强',
    default_params: {
      num_inference_steps: 20,
      guidance_scale: 7.5,
      sync_mode: false,
      width: 1024,
      height: 1024,
      strength: 0.8
    },
    // 实际支持的参数
    supported_params: ['image_url', 'prompt', 'seed', 'sync_mode', 'num_inference_steps', 'guidance_scale', 'width', 'height', 'negative_prompt', 'strength']
  },

  // 3D模型生成模型
  'fal-ai/trellis': {
    name: 'Trellis 3D',
    type: 'image-to-3d',
    description: '图像转3D模型',
    default_params: {
      scale: 1.0,
      num_samples: 1,
      output_format: 'glb',
      simplify: false,
      texture_size: 1024,
      max_faces: 10000,
      sync_mode: false
    },
    // Trellis实际支持的参数（基于API文档）
    supported_params: ['prompt', 'image_url', 'seed', 'sync_mode', 'scale', 'num_samples', 'output_format', 'simplify', 'texture_size', 'max_faces']
  }
}

// 参数选项配置
export const PARAM_OPTIONS = {
  output_format: ['glb', 'obj', 'gltf', 'ply'],
  image_formats: ['jpg', 'jpeg', 'png', 'webp'],
  model_formats: ['glb', 'gltf', 'obj', 'fbx', 'stl', 'dae', 'ply']
}

// 参数范围配置
export const PARAM_RANGES = {
  // 通用参数
  num_inference_steps: { min: 10, max: 50, step: 1, default: 20 },
  guidance_scale: { min: 1.0, max: 20.0, step: 0.1, default: 7.5 },
  strength: { min: 0.1, max: 1.0, step: 0.1, default: 0.8 },
  seed: { min: 0, max: 999999999, step: 1, default: null },

  // 图像尺寸
  width: { min: 256, max: 2048, step: 64, default: 1024 },
  height: { min: 256, max: 2048, step: 64, default: 1024 },
  num_images: { min: 1, max: 4, step: 1, default: 1 },

  // 3D模型参数
  scale: { min: 0.1, max: 5.0, step: 0.1, default: 1.0 },
  num_samples: { min: 1, max: 4, step: 1, default: 1 },
  texture_size: { min: 256, max: 2048, step: 128, default: 1024 },
  max_faces: { min: 1000, max: 50000, step: 1000, default: 10000 }
}

// 模型类型分类
export const MODEL_TYPES = {
  'text-to-image': ['fal-ai/nano-banana-pro'],
  'image-edit': ['fal-ai/nano-banana-pro/edit'],
  'image-to-3d': ['fal-ai/trellis']
}

// 生成类型映射
export const GENERATION_TYPES = {
  'image': ['fal-ai/nano-banana-pro', 'fal-ai/nano-banana-pro/edit'],
  '3d': ['fal-ai/trellis']
}