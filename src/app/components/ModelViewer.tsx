import React from 'react'

export default function ModelViewer(props: Record<string, unknown>) {
  return React.createElement('model-viewer', props as any)
}
