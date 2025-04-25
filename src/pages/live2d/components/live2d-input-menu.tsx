import { Live2DInput } from './live2d-input'
import Live2DMenu from './live2d-menu'
import { IoChatboxSharp, IoSettingsOutline } from 'react-icons/io5'
import { FaExchangeAlt } from 'react-icons/fa'
import { HiMiniSpeakerWave } from 'react-icons/hi2'
import { RiNewspaperLine } from 'react-icons/ri'
import { IoMdClose } from 'react-icons/io'

interface Live2DInputMenuProps {
  containerRef: React.RefObject<HTMLDivElement>
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
}

export const Live2DInputMenu = ({ containerRef, menuOpen, setMenuOpen }: Live2DInputMenuProps) => {
  const handleCloseMenu = () => {
    setMenuOpen(false)
  }

  const leftButtons = [
    {
      color: 'bg-rose-400 hover:bg-rose-500',
      onClick: () => console.log('Settings button clicked'),
      icon: <IoChatboxSharp size={20} />,
    },
    {
      color: 'bg-amber-400 hover:bg-amber-500',
      onClick: () => console.log('Switch model button clicked'),
      icon: <FaExchangeAlt />,
    },
    {
      color: 'bg-emerald-400 hover:bg-emerald-500',
      onClick: () => console.log('Skin button clicked'),
      icon: <IoSettingsOutline size={20} />,
    },
  ]

  const rightButtons = [
    {
      color: 'bg-sky-400 hover:bg-sky-500',
      onClick: () => console.log('Interaction button clicked'),
      icon: <HiMiniSpeakerWave size={20} />,
    },
    {
      color: 'bg-violet-400 hover:bg-violet-500',
      onClick: () => console.log('Voice button clicked'),
      icon: <RiNewspaperLine size={20} />,
    },
    {
      color: 'bg-slate-400 hover:bg-slate-500',
      onClick: handleCloseMenu,
      icon: <IoMdClose size={20} />,
    },
  ]

  return (
    <>
      <Live2DMenu
        referenceElement={containerRef}
        isOpen={menuOpen}
        onClose={handleCloseMenu}
        leftButtons={leftButtons}
        rightButtons={rightButtons}
      />
      <Live2DInput isVisible={menuOpen} containerRef={containerRef} onClose={handleCloseMenu} />
    </>
  )
}
