import { CLASSNAME } from '@/constants/classname'
import { WINDOWS_ID } from '@/constants/windowsId'
import { useEffect } from 'react'

const IGNORE_MOUSE_EVENTS_NODE_NAME = ['CANVAS', 'IMG', 'SVG', 'PATH']

const mouseMoveListener = (e: MouseEvent) => {
    console.log('mouseMoveListener', e.target)
    if (e.target instanceof HTMLElement && (e.target.className.includes(CLASSNAME.IGNORE_MOUSE_EVENTS) || IGNORE_MOUSE_EVENTS_NODE_NAME.includes(e.target.nodeName.toUpperCase()))) {
        console.log('toggleIgnoreMouseEvents', { ignore: false, windowId: WINDOWS_ID.MAIN, forward: true })
        window.electronAPI.toggleIgnoreMouseEvents({ ignore: false, windowId: WINDOWS_ID.MAIN, forward: true })
    } else {
        console.log('toggleIgnoreMouseEvents', { ignore: true, windowId: WINDOWS_ID.MAIN, forward: true })
        window.electronAPI.toggleIgnoreMouseEvents({ ignore: true, windowId: WINDOWS_ID.MAIN, forward: true })
    }
}

export const useIgnoreClick = () => {
    useEffect(() => {
        window.addEventListener('mousemove', mouseMoveListener)
        return () => {
            window.removeEventListener('mousemove', mouseMoveListener)
        }
    }, [])
}
