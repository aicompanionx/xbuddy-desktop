import TextareaAutosize from 'react-textarea-autosize'
import { cn } from '@/utils'
import { useTranslation } from 'react-i18next'
import { IoMic, IoSend } from 'react-icons/io5'
import { Button } from '@/components/ui/button'
import { Live2DRaidX } from './live2d-raidx-x'
import { useLive2D } from '@/contexts/live2d-context'

interface Live2DInputAndIconsProps {
  style?: React.CSSProperties
  onClose: () => void
}

export const Live2DInputAndIcons = ({ style }: Live2DInputAndIconsProps) => {
  const {
    inputValue,
    textareaRef,
    isMultiline,
    // Methods
    handleInputChange,
    handleHeightChange,
    handleKeyDown,
    onSend,
  } = useLive2D()

  const { t } = useTranslation()

  return (
    <>
      <div className="w-full relative" style={style}>
        <TextareaAutosize
          ref={textareaRef}
          value={inputValue}
          onChange={handleInputChange}
          maxRows={isMultiline ? 8 : 2}
          placeholder={t('live2d.inputPlaceholder')}
          cacheMeasurements
          className={cn(
            'block h-[40px] resize-none border-none outline-0 shadow-none px-3 py-2 rounded w-full text-sm placeholder:text-white/80 text-white',
          )}
          onHeightChange={handleHeightChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          data-gramm="false"
        />
      </div>

      <div className={cn('flex items-center', isMultiline ? 'self-end' : 'ml-2')} style={style}>
        <Live2DRaidX />

        <Button
          size="icon"
          className="w-8 h-8 !bg-transparent text-white hover:text-white/50 rounded-full !shadow-none !outline-none"
          aria-label={t('live2d.voiceInput')}
        >
          <IoMic size={20} />
        </Button>
        <Button
          size="icon"
          className="w-8 h-8 !bg-transparent text-white hover:text-white/50 rounded-full !shadow-none !outline-none"
          onClick={onSend}
          aria-label={t('live2d.sendMessage')}
        >
          <IoSend size={18} className="-translate-y-0.5 rotate-[-45deg]" />
        </Button>
      </div>
    </>
  )
}
