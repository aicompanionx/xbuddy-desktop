import { Live2DChat } from './live2d-chat'
import Live2DMenu from './live2d-menu'
import { IoChatboxSharp, IoSettingsOutline } from 'react-icons/io5'
import { FaExchangeAlt } from 'react-icons/fa'
import { HiMiniSpeakerWave, HiMiniSpeakerXMark } from 'react-icons/hi2'
import { RiNewspaperLine } from 'react-icons/ri'
import { IoMdClose } from 'react-icons/io'
import { useRef } from 'react'
import { useLive2DMenu } from '@/contexts/live2d-menu-context'
import { useVolume } from '../hooks/use-volum'

interface Live2DChatAndMenuProps {
  containerRef: React.RefObject<HTMLDivElement>
}

export const Live2DChatAndMenu = ({ containerRef }: Live2DChatAndMenuProps) => {
  const settingsButtonRef = useRef<HTMLDivElement>(null)

  const { setIsMenuOpen, isMenuOpen } = useLive2DMenu()

  const { isVolumeOpen, setIsVolumeOpen } = useVolume()

  const leftButtons = [
    {
      color: 'bg-rose-400 hover:bg-rose-500',
      onClick: () => {
        window.electronAPI.createChatWindow()
      },
      icon: <IoChatboxSharp size={20} />,
    },
    {
      color: 'bg-amber-400 hover:bg-amber-500',
      onClick: () => console.log('Switch model button clicked'),
      icon: <FaExchangeAlt />,
    },
    {
      color: 'bg-emerald-400 hover:bg-emerald-500',
      onClick: () => {
        window.electronAPI.createSettingWindow()
      },
      icon: <IoSettingsOutline size={20} />,
    },
  ]

  const rightButtons = [
    {
      color: 'bg-sky-400 hover:bg-sky-500',
      onClick: () => setIsVolumeOpen(!isVolumeOpen),
      icon: isVolumeOpen ? <HiMiniSpeakerWave size={20} /> : <HiMiniSpeakerXMark size={20} />,
    },
    {
      color: 'bg-violet-400 hover:bg-violet-500',
      onClick: () => console.log('Voice button clicked'),
      icon: <RiNewspaperLine size={20} />,
    },
    {
      color: 'bg-slate-400 hover:bg-slate-500',
      onClick: () => setIsMenuOpen(false),
      icon: <IoMdClose size={20} />,
    },
  ]

  return (
    <>
      <Live2DMenu
        referenceElement={containerRef}
        isOpen={isMenuOpen}
        leftButtons={leftButtons}
        rightButtons={rightButtons}
        onSettingsButtonMount={(ref) => (settingsButtonRef.current = ref)}
      />
      <Live2DChat isVisible={isMenuOpen} containerRef={containerRef} />
    </>
  )
}
