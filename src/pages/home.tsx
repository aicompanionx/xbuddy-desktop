import { Button } from '@/components/ui/button'
import { useEffect, useRef } from 'react'

const Home: React.FC = () => {
  const linkRef = useRef<HTMLAnchorElement>(null)
  // Handler function for creating Live2D window
  const handleCreateLive2D = async () => {
    try {
      // Call electron API to create Live2D window with specific URL
      await window.electronAPI.createLive2DWindow({
        width: 300,
        height: 480,
        hash: '/#/live2d', // Specify URL to load in the new window
      })
    } catch (error) {
      console.error('Failed to create Live2D window:', error)
    }
  }

  // Listen for auto-create-live2d event from main process
  useEffect(() => {
    // Define the event listener
    const handleAutoCreateLive2D = () => {
      console.log('Received auto-create-live2d event from main process')
      handleCreateLive2D()
    }

    // Setup event listener if API is available
    if (window.electronAPI && typeof window.electronAPI.onWindowMessage === 'function') {
      console.log('Setting up auto-create-live2d event listener')
      const cleanup = window.electronAPI.onWindowMessage('auto-create-live2d', handleAutoCreateLive2D)
      return cleanup
    }
  }, [])

  const handleMouseEnter = () => {
    console.log('Mouse entered')
    window.electronAPI.toggleIgnoreMouseEvents({
      ignore: false,
      windowId: 'main',
      forward: true,
    })
  }

  const handleMouseLeave = () => {
    console.log('Mouse left')
    window.electronAPI.toggleIgnoreMouseEvents({
      ignore: true,
      windowId: 'main',
      forward: true,
    })
  }

  useEffect(() => {
    if (linkRef.current) {
      setTimeout(() => {
        linkRef.current.click()
      }, 5000)
    }
  }, [linkRef.current])

  return (
    <div className="space-y-4">
      <div className="w-[100px] h-[100px] bg-red-500" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <p>Hello</p>
        <p>World</p>
        <a href="https://www.baidu.com" target="_blank" ref={linkRef}>
          百度
        </a>
      </div>
      <Button onClick={handleCreateLive2D} className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
        Create Live2D Character
      </Button>
      {/* <BrowserMonitor /> */}
    </div>
  )
}

export default Home
