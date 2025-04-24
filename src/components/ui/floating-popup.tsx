import { ReactNode, useEffect, useRef, RefObject } from 'react'
import { FloatingArrow, Placement, arrow, flip, offset, shift, useFloating } from '@floating-ui/react'
import { cn } from '@/utils'
import { CLASSNAME } from '@/constants/classname'

interface FloatingPopupProps {
  isActive: boolean
  children: ReactNode
  referenceElement?: RefObject<HTMLElement> | null
  placement?: Placement
  offsetDistance?: number
  width?: string
  backgroundColor?: string
  className?: string
  darkBackgroundColor?: string
  arrowTipDistance?: number
}

const FloatingPopup = ({
  isActive,
  children,
  referenceElement,
  placement = 'top',
  offsetDistance = 0,
  width = 'w-max',
  backgroundColor = 'bg-white',
  darkBackgroundColor = 'dark:bg-gray-800',
  className,
  arrowTipDistance = 1,
}: FloatingPopupProps) => {
  const arrowRef = useRef<SVGSVGElement>(null)

  const { refs, floatingStyles, context } = useFloating({
    open: isActive,
    placement,
    middleware: [
      offset(offsetDistance),
      flip({
        fallbackPlacements: placement.startsWith('top') ? ['bottom'] : placement.startsWith('bottom') ? ['top'] : [],
        crossAxis: false,
        padding: 10,
      }),
      shift({
        padding: 10,
      }),
      arrow({ element: arrowRef }),
    ],
  })

  // Get base animation classes
  const animationClasses = cn(
    'z-50 transition-opacity duration-300',
    width,
    isActive ? 'animate-in fade-in opacity-100' : 'opacity-0 pointer-events-none',
    CLASSNAME.IGNORE_MOUSE_EVENTS,
    className,
  )

  useEffect(() => {
    if (referenceElement?.current) {
      refs.setReference({
        getBoundingClientRect() {
          return referenceElement.current.getBoundingClientRect()
        },
      })
    }
  }, [referenceElement, refs.setReference])

  return (
    <div ref={refs.setFloating} style={floatingStyles} className={animationClasses}>
      <div
        className={cn(
          'rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700',
          backgroundColor,
          darkBackgroundColor,
        )}
      >
        {children}
      </div>

      {/* Arrow pointing to reference */}
      <FloatingArrow
        ref={arrowRef}
        context={context}
        tipRadius={arrowTipDistance}
        height={10}
        fill="#fff"
        // className={cn(backgroundColor, darkBackgroundColor)}
      />
    </div>
  )
}

export default FloatingPopup
