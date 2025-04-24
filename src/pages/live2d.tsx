import React, { useEffect, useState } from 'react'
import { useAppStore } from '@/store/app'
import { Live2DContainer } from '@/components/live2d/live2d-container'

const Live2DPage: React.FC = () => {
  const { selectWindow } = useAppStore()
  const [windowId, setWindowId] = useState<string>('')

  // Get window ID and update app state
  useEffect(() => {
    const cleanup = window.electronAPI.onWindowId((id: string) => {
      setWindowId(id)
      console.log('Live2D Window ID:', id)
      selectWindow(id)
    })

    return cleanup
  }, [selectWindow])

  return (
    <>
      {windowId && <Live2DContainer windowId={windowId} autoResize={true} width={300} height={500} fullscreen={true} />}
    </>
  )
}

export default Live2DPage
