'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, File, AlertCircle, CheckCircle } from 'lucide-react'

interface ModelFile {
  id: string
  file: File
  name: string
  size: number
  type: string
  url: string
  preview?: string
}

interface ModelUploaderProps {
  onFilesChange: (files: ModelFile[]) => void
  maxFiles?: number
  maxSize?: number // MB
  acceptedFormats?: string[]
}

export default function ModelUploader({
  onFilesChange,
  maxFiles = 5,
  maxSize = 100,
  acceptedFormats = ['.glb', '.gltf', '.obj', '.fbx', '.stl', '.dae', '.ply']
}: ModelUploaderProps) {
  const [files, setFiles] = useState<ModelFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = useCallback((file: File): string | null => {
    // 检查文件格式
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedFormats.includes(fileExtension)) {
      return `不支持的文件格式: ${fileExtension}。支持的格式: ${acceptedFormats.join(', ')}`
    }

    // 检查文件大小
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      return `文件大小超过限制。最大允许 ${maxSize}MB，当前文件 ${fileSizeMB.toFixed(2)}MB`
    }

    return null
  }, [acceptedFormats, maxSize])

  const processFile = useCallback(async (file: File): Promise<ModelFile | null> => {
    const error = validateFile(file)
    if (error) {
      setErrors(prev => [...prev, error])
      return null
    }

    try {
      // 创建文件URL
      const url = URL.createObjectURL(file)

      // 尝试生成预览（如果是GLTF/GLB文件）
      let preview: string | undefined

      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        type: file.type || file.name.split('.').pop()?.toLowerCase() || 'unknown',
        url,
        preview
      }
    } catch (err) {
      setErrors(prev => [...prev, `处理文件 ${file.name} 时出错`])
      return null
    }
  }, [validateFile])

  const handleFiles = useCallback(async (fileList: FileList) => {
    const newErrors: string[] = []
    const fileArray = Array.from(fileList)

    // 检查文件数量限制
    if (files.length + fileArray.length > maxFiles) {
      newErrors.push(`最多只能上传 ${maxFiles} 个文件`)
      setErrors(prev => [...prev, ...newErrors])
      return
    }

    setErrors([])

    // 处理每个文件
    const newFiles: ModelFile[] = []
    for (const file of fileArray) {
      const processedFile = await processFile(file)
      if (processedFile) {
        newFiles.push(processedFile)
      }
    }

    const updatedFiles = [...files, ...newFiles]
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }, [files, maxFiles, onFilesChange, processFile])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  const removeFile = useCallback((id: string) => {
    const fileToRemove = files.find(f => f.id === id)
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.url)
    }

    const updatedFiles = files.filter(f => f.id !== id)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }, [files, onFilesChange])

  const clearAll = useCallback(() => {
    files.forEach(f => URL.revokeObjectURL(f.url))
    setFiles([])
    setErrors([])
    onFilesChange([])
  }, [files, onFilesChange])

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className="space-y-4">
      {/* 拖拽上传区域 */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-gray-600 bg-gray-800/30 hover:border-purple-500 hover:bg-purple-500/5'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />

        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          拖拽模型文件到这里或点击上传
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          支持格式: {acceptedFormats.join(', ')}
        </p>
        <p className="text-gray-500 text-xs">
          最大文件大小: {maxSize}MB | 最多文件数量: {maxFiles}
        </p>
      </div>

      {/* 错误提示 */}
      {errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <h4 className="text-red-400 font-medium">上传错误</h4>
          </div>
          <ul className="space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-red-300 text-sm">{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 已上传文件列表 */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-medium">
              已上传文件 ({files.length}/{maxFiles})
            </h4>
            <button
              onClick={clearAll}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              清空全部
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between bg-gray-800/50 border border-gray-700 rounded-lg p-3"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <File className="h-8 w-8 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{file.name}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <span>{file.type.toUpperCase()}</span>
                      <span>•</span>
                      <span>{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="flex-shrink-0 ml-3 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 上传统计 */}
      {files.length > 0 && (
        <div className="bg-gray-800/30 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">总大小:</span>
            <span className="text-white">
              {formatFileSize(files.reduce((total, file) => total + file.size, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}