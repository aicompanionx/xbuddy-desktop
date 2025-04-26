import { ReactNode, useEffect, useRef, RefObject } from 'react'
import {
  FloatingArrow,
  Placement,
  arrow,
  flip,
  autoUpdate,
  offset,
  shift,
  useFloating,
  OffsetOptions,
} from '@floating-ui/react'
import { cn } from '@/utils'
import { CLASSNAME } from '@/constants/classname'

interface FloatingPopupProps {
  isActive: boolean
  children?: ReactNode
  referenceElement?: RefObject<HTMLElement> | null
  placement?: Placement
  offsetDistance?: OffsetOptions
  width?: string
  backgroundColor?: string
  className?: string
  popupClassName?: string
  darkBackgroundColor?: string
  arrowTipDistance?: number
  expandUpwards?: boolean
  isNeedArrow?: boolean
}

const FloatingPopup = ({
  isActive,
  children,
  referenceElement,
  placement = 'top',
  offsetDistance = 0,
  className,
  popupClassName,
  arrowTipDistance = 1,
  expandUpwards = false,
  isNeedArrow = false,
}: FloatingPopupProps) => {
  const arrowRef = useRef<SVGSVGElement>(null)

  // Adjust placement based on expandUpwards preference
  const effectivePlacement = expandUpwards
    ? placement.includes('-')
      ? `top${placement.slice(placement.indexOf('-'))}`
      : 'top'
    : placement

  const { refs, floatingStyles, context, update } = useFloating({
    open: isActive,
    placement: effectivePlacement as Placement,
    strategy: 'fixed',
    middleware: [
      offset(offsetDistance),
      flip({
        fallbackPlacements: effectivePlacement.startsWith('top')
          ? ['bottom']
          : effectivePlacement.startsWith('bottom')
          ? ['top']
          : [],
        crossAxis: false,
        padding: 10,
      }),
      shift({
        padding: 10,
      }),
      isNeedArrow && arrow({ element: arrowRef }),
    ],
    whileElementsMounted: autoUpdate,
  })

  // Get base animation classes
  const animationClasses = cn(
    'z-50 transition-opacity duration-300',
    isActive ? 'animate-in fade-in opacity-100' : 'opacity-0 pointer-events-none',
    CLASSNAME.IGNORE_MOUSE_EVENTS,
    expandUpwards ? 'flex flex-col-reverse' : '',
    popupClassName,
  )

  useEffect(() => {
    if (referenceElement?.current) {
      refs.setPositionReference({
        getBoundingClientRect() {
          return referenceElement.current.getBoundingClientRect()
        },
      })

      update()

      const handleTransitionEnd = () => {
        refs.setReference({
          getBoundingClientRect() {
            return referenceElement.current.getBoundingClientRect()
          },
        })
        update()
      }

      referenceElement.current.addEventListener('transitionend', handleTransitionEnd)

      const handleAnimationComplete = () => {
        setTimeout(() => {
          if (referenceElement?.current) {
            refs.setReference({
              getBoundingClientRect() {
                return referenceElement.current.getBoundingClientRect()
              },
            })
            update()
          }
        }, 50)
      }

      referenceElement.current.addEventListener('animationend', handleAnimationComplete)

      return () => {
        referenceElement.current?.removeEventListener('transitionend', handleTransitionEnd)
        referenceElement.current?.removeEventListener('animationend', handleAnimationComplete)
      }
    }
  }, [referenceElement, refs])

  return (
    <div ref={refs.setFloating} style={floatingStyles} className={animationClasses}>
      <div
        className={cn(
          'bg-[#fff] dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700',
          'bg-[#E8F1FF] dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700',
          className,
        )}
      >
        {children}
      </div>

      {/* Arrow pointing to reference */}
      {isNeedArrow && (
        <FloatingArrow
          ref={arrowRef}
          context={context}
          tipRadius={arrowTipDistance}
          height={10}
          fill="#fff"
          // className={cn(backgroundColor, darkBackgroundColor)}
        />
      )}
    </div>
  )
}

export default FloatingPopup
