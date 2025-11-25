import { create } from 'zustand'
import { User, Model, ModelFile } from '@/lib/supabase'

interface AppState {
  // User state
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  
  // Models state
  models: Model[]
  currentModel: Model | null
  currentModelFile: ModelFile | null
  setModels: (models: Model[]) => void
  setCurrentModel: (model: Model | null) => void
  setCurrentModelFile: (file: ModelFile | null) => void
  
  // UI state
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  
  // Loading state
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  
  // 3D Viewer state
  viewerSettings: {
    wireframe: boolean
    showGrid: boolean
    showAxes: boolean
    backgroundColor: string
    lightingPreset: string
  }
  setViewerSettings: (settings: Partial<AppState['viewerSettings']>) => void
  
  // Editor state
  editorMode: 'preview' | 'edit'
  setEditorMode: (mode: 'preview' | 'edit') => void
}

export const useStore = create<AppState>((set) => ({
  // User state
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  // Models state
  models: [],
  currentModel: null,
  currentModelFile: null,
  setModels: (models) => set({ models }),
  setCurrentModel: (model) => set({ currentModel: model }),
  setCurrentModelFile: (file) => set({ currentModelFile: file }),
  
  // UI state
  sidebarOpen: true,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  
  // Loading state
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  
  // 3D Viewer state
  viewerSettings: {
    wireframe: false,
    showGrid: true,
    showAxes: true,
    backgroundColor: '#1a1a1a',
    lightingPreset: 'studio',
  },
  setViewerSettings: (settings) => set((state) => ({
    viewerSettings: { ...state.viewerSettings, ...settings },
  })),
  
  // Editor state
  editorMode: 'preview',
  setEditorMode: (editorMode) => set({ editorMode }),
}))