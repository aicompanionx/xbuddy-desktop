import React, { useEffect, useState } from 'react'
import { useAppStore } from '@/store/app'
import { PhishingAlert } from '../components/features/phishing-alert'
import { useBrowserSafetyMonitor } from '../hooks/use-browser-safety-monitor'
import { Live2DContainer } from '../components/features/live2d-container'

const modelPath = `assets/live2d/hiyori_free_en/runtime/hiyori_free_t08.model3.json`

const Live2DPage: React.FC = () => {
  const { selectWindow } = useAppStore()
  const [windowId, setWindowId] = useState<string>('')
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })
  const [componentKey, setComponentKey] = useState(Date.now())

  // 使用整合后的浏览器安全监控钩子
  const { shouldShowAlert, alertResult, handleAlertClose, isMonitorActive } = useBrowserSafetyMonitor()

  // 获取窗口ID并更新应用状态
  useEffect(() => {
    const cleanup = window.electronAPI.onWindowId((id) => {
      setWindowId(id)
      console.log('Live2D窗口ID:', id)
      selectWindow(id)
    })

    return cleanup
  }, [selectWindow])

  // 处理窗口大小调整
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
      setComponentKey(Date.now())
      console.log('窗口大小调整:', window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <>
      {windowId && (
        <Live2DContainer
          key={componentKey}
          windowId={windowId}
          modelPath={modelPath}
          width={windowSize.width}
          height={windowSize.height}
          autoResize={true}
          fullscreen={true}
        />
      )}

      {/* 风险URL警告组件 - 置于顶部以获得最大可见性 */}
      {shouldShowAlert && (
        <div className="fixed top-0 left-0 right-0 p-2 z-[9999] pointer-events-auto">
          <PhishingAlert result={alertResult} onClose={handleAlertClose} className="shadow-xl border-2 animate-pulse" />
        </div>
      )}
    </>
  )
}

export default Live2DPage
