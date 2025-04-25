import { RefObject, useCallback, useEffect, useState, useRef } from 'react'

import FloatingPopup from '../ui/floating-popup'
import useNewsWebSocket from '@/hooks/websocket/news/use-news-websocket'
import { WINDOWS_ID } from '@/constants/windowsId'

interface NewsAlertProps {
  referenceElement: RefObject<HTMLElement>
}

const NewsAlert = ({ referenceElement }: NewsAlertProps) => {
  const { latestNews } = useNewsWebSocket()
  const [isActive, setIsActive] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const previousNewsRef = useRef<string | null>(null)

  // Handle new news arrival
  useEffect(() => {
    if (latestNews && previousNewsRef.current !== latestNews.id?.toString()) {
      // Update previous news ref to avoid showing the same news again
      previousNewsRef.current = latestNews.id?.toString() || latestNews.title

      // Show the popup
      setIsActive(true)

      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      // Set new timer to hide popup after 5 seconds
      timerRef.current = setTimeout(() => {
        if (!isHovering) {
          setIsActive(false)
        }
      }, 5000)
    }

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [latestNews, isHovering])

  // Handle mouse enter event
  const handleMouseEnter = () => {
    setIsHovering(true)
    // Clear timer when mouse enters
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  // Handle mouse leave event
  const handleMouseLeave = () => {
    setIsHovering(false)
    // Set timer to close popup when mouse leaves
    timerRef.current = setTimeout(() => {
      setIsActive(false)
    }, 2000)
  }

  // Handle opening news detail window
  const handleOpenNewsDetail = useCallback(() => {
    if (!latestNews) return

    // Create news window
    window.electronAPI.createNewsWindow({ width: 1400, height: 1200 }).then(() => {
      // Send news data to the created window
      // Use setTimeout to ensure window is ready
      setTimeout(() => {
        window.electronAPI.sendMessageToWindow(WINDOWS_ID.NEWS, 'news-data', latestNews)
      }, 500)
    })

    // Close the popup
    setIsActive(false)
  }, [latestNews])

  return (
    <>
      <FloatingPopup
        isActive={isActive && !!latestNews}
        referenceElement={referenceElement}
        placement="top"
        className="flex justify-between items-start w-96"
      >
        <div
          className="cursor-pointer"
          onClick={handleOpenNewsDetail}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <p>{latestNews?.title}</p>
          <span className="text-blue-500 text-sm">Click to view details</span>
        </div>
      </FloatingPopup>
    </>
  )
}

export default NewsAlert
