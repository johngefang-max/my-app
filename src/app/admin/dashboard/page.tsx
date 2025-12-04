'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminStats {
  totalUsers: number
  totalModels: number
  totalGenerated: number
  activeUsers: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalModels: 0,
    totalGenerated: 0,
    activeUsers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查管理员认证状态
    const checkAdminAuth = () => {
      if (typeof window !== 'undefined') {
        const adminAuth = localStorage.getItem('admin_auth')
        if (adminAuth !== 'true') {
          // 未认证，重定向到登录页
          router.push('/admin')
          return
        }
        setIsAdmin(true)
      }
    }

    checkAdminAuth()
  }, [router])

  useEffect(() => {
    if (isAdmin) {
      fetchAdminStats()
    }
  }, [isAdmin])

  const fetchAdminStats = async () => {
    try {
      setLoading(true)
      // 这里可以调用实际的API获取统计数据
      // 暂时使用模拟数据
      setTimeout(() => {
        setStats({
          totalUsers: 1247,
          totalModels: 5632,
          totalGenerated: 12847,
          activeUsers: 234
        })
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('获取统计数据失败:', error)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_auth')
    }
    router.push('/admin')
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>验证管理员身份中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-white">管理员仪表板</h1>
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">已认证</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-300 hover:text-white">设置</button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: '总用户数', value: stats.totalUsers, change: '+12%', changeType: 'positive' },
            { label: '总模型数', value: stats.totalModels, change: '+8%', changeType: 'positive' },
            { label: '生成次数', value: stats.totalGenerated, change: '+23%', changeType: 'positive' },
            { label: '活跃用户', value: stats.activeUsers, change: '-2%', changeType: 'negative' }
          ].map((stat, index) => (
            <div key={index} className="bg-black/30 rounded-xl p-6 border border-white/10">
              <h3 className="text-gray-400 text-sm font-medium mb-2">{stat.label}</h3>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-white mb-2">{stat.value.toLocaleString()}</div>
                  <div className={`text-sm ${stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.change} 较上月
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Models */}
          <div className="bg-black/30 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">最近生成的模型</h3>
            <div className="space-y-3">
              {[
                { name: '奇幻角色设计', user: 'user123', time: '2分钟前' },
                { name: '现代建筑设计', user: 'designer456', time: '5分钟前' },
                { name: '产品概念展示', user: 'creator789', time: '8分钟前' },
                { name: '抽象艺术雕塑', user: 'artist012', time: '15分钟前' }
              ].map((model, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                  <div>
                    <div className="text-white font-medium">{model.name}</div>
                    <div className="text-gray-400 text-sm">by {model.user}</div>
                  </div>
                  <div className="text-gray-500 text-sm">{model.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-black/30 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">系统状态</h3>
            <div className="space-y-4">
              {[
                { service: 'AI模型生成服务', status: '正常', uptime: '99.9%' },
                { service: '文件存储服务', status: '正常', uptime: '99.5%' },
                { service: '数据库服务', status: '正常', uptime: '99.8%' },
                { service: 'CDN分发服务', status: '正常', uptime: '99.7%' }
              ].map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">{service.service}</div>
                    <div className="text-gray-400 text-sm">正常运行时间: {service.uptime}</div>
                  </div>
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                    {service.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-black/30 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">快速操作</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '用户管理', icon: '👥', action: () => console.log('用户管理') },
              { label: '模型审核', icon: '🎨', action: () => console.log('模型审核') },
              { label: '系统设置', icon: '⚙️', action: () => console.log('系统设置') },
              { label: '数据导出', icon: '📊', action: () => console.log('数据导出') }
            ].map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg p-4 text-center transition-colors"
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-sm">{item.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}