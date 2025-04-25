import { ComponentProps } from 'react'
import { X } from 'lucide-react'

import { useAlert } from '@/contexts/alert-context'
import FloatingPopup from '../ui/floating-popup'
import { cn } from '@/utils'

const NoticeAlert = ({
  isActive,
  referenceElement,
  children,
  className,
  popupClassName,
  ...props
}: ComponentProps<typeof FloatingPopup>) => {
  const { closeAlert } = useAlert()

  return (
    <FloatingPopup
      isActive={isActive}
      referenceElement={referenceElement}
      placement="top"
      className={cn('w-max max-w-xs', popupClassName)}
      {...props}
    >
      <div className={cn('flex justify-between items-start', className)}>
        {children}
        <button onClick={closeAlert} className="text-gray-400 hover:text-gray-200 transition-colors">
          <X className="h-5 w-5 cursor-pointer" />
        </button>
      </div>
    </FloatingPopup>
  )
}

export default NoticeAlert
