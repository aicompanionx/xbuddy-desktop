import { useRef, useState, useEffect } from 'react'
import { Live2DModel } from 'pixi-live2d-display'
import { WINDOWS_ID } from '@/constants/windowsId'

type PixiApp = any
type ModelCleanupFn = () => void

interface UseLive2DModelProps {
  modelPath: string
  width: number
  height: number
  canvasRef: React.RefObject<HTMLCanvasElement>
}

interface UseLive2DModelReturn {
  isLoading: boolean
  loadError: string | null
  model: Live2DModel | null
}

// Helper function to safely set model position
const safeSetModelPosition = (model: any, x: number, y: number) => {
  if (!model) return

  try {
    if (model.position) {
      model.position.x = x
      model.position.y = y
    } else {
      model.x = x
      model.y = y
    }
  } catch (error) {
    console.error('Error setting model position:', error)
  }
}

// Helper function to safely set model scale
const safeSetModelScale = (model: any, scale: number) => {
  if (!model) return

  try {
    if (model.scale) {
      if (typeof model.scale.set === 'function') {
        model.scale.set(scale, scale)
      } else {
        model.scale.x = scale
        model.scale.y = scale
      }
    }
  } catch (error) {
    console.error('Error setting model scale:', error)
  }
}

// Setup model properties
const setupModel = (model: Live2DModel, app: any, width: number, height: number) => {
  try {
    // Center the model in the canvas
    safeSetModelPosition(model, width / 2, height / 2)

    // Use a smaller initial scale to ensure full model visibility
    safeSetModelScale(model, 0.1)

    // Add model to stage
    app.stage.addChild(model)

    // Force model to be centered in canvas
    model.anchor.set(0.5, 0.5)

    return true
  } catch (error) {
    console.error('Error setting up model:', error)
    return false
  }
}

// Setup animation ticker
const setupTicker = (model: Live2DModel, app: any, width: number, height: number) => {
  try {
    // Create animation loop
    const animate = () => {
      try {
        // Ensure model stays centered
        if (model) {
          safeSetModelPosition(model, width / 2, height / 2)
        }
        app.render()
      } catch (error) {
        console.error('Render error in animation loop:', error)
      }
    }

    // Set up ticker for animation
    app.ticker.add(animate)

    // Return cleanup function for ticker
    return () => {
      try {
        app.ticker.remove(animate)
      } catch (error) {
        console.error('Error removing ticker:', error)
      }
    }
  } catch (error) {
    console.error('Error setting up ticker:', error)
    return null
  }
}

export function useLive2DModel({
  modelPath,
  width,
  height,
  canvasRef,
}: UseLive2DModelProps): UseLive2DModelReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const appRef = useRef<PixiApp | null>(null)
  const modelRef = useRef<Live2DModel | null>(null)
  const cleanupFnRef = useRef<ModelCleanupFn | null>(null)
  const dimensionsChangedRef = useRef(false)
  const isDraggingRef = useRef(false)
  const initialMousePositionRef = useRef({ x: 0, y: 0 })
  const initialWindowPositionRef = useRef({ x: 0, y: 0 })
  const windowPositionRef = useRef({ x: 0, y: 0 })

  // Effect for loading the model
  useEffect(() => {
    if (!canvasRef.current) return

    console.log('Initializing model - modelPath changed or first load')

    // Clean up previous app and model
    if (cleanupFnRef.current) {
      cleanupFnRef.current()
      cleanupFnRef.current = null
    }

    // Reset state
    appRef.current = null
    modelRef.current = null
    dimensionsChangedRef.current = false

    // Initialize the application
    const initApp = async () => {
      if (!canvasRef.current) return

      setIsLoading(true)
      setLoadError(null)

      try {
        // Create PIXI app
        // @ts-expect-error - Type definitions don't match actual usage
        const app = new PIXI.Application({
          width: width,
          height: height,
          transparent: true,
          view: canvasRef.current,
          forceWebGL: true,
          autoDensity: true,
          resolution: window.devicePixelRatio * 2,
        })

        console.log('PIXI application created successfully')
        appRef.current = app

        // Check if model file exists
        const response = await fetch(modelPath)
        if (!response.ok) {
          throw new Error(`Model file doesn't exist or can't be accessed: ${response.status}`)
        }

        console.log('Model file exists, starting load')

        // Load model
        // @ts-expect-error - Type definitions don't match actual usage
        const model = await Live2DModel.from(modelPath, {
          autoInteract: false,
          autoUpdate: true,
        })

        console.log('Model loaded successfully', model)
        modelRef.current = model

        // Make model instance available globally for interaction and debugging
        if (typeof window !== 'undefined') {
          window.model = model;
        }

        // Setup model properties
        const setupSuccess = setupModel(model, app, width, height)
        if (!setupSuccess) {
          throw new Error('Failed to setup model')
        }

        // Setup render loop
        const cleanupTicker = setupTicker(model, app, width, height)

        // Create cleanup function
        cleanupFnRef.current = () => {
          console.log('Cleaning up PIXI application and model')
          if (cleanupTicker) cleanupTicker()

          if (model) {
            try {
              if (app.stage && app.stage.children.includes(model)) {
                app.stage.removeChild(model)
              }
              model.destroy()
            } catch (error) {
              console.error('Error cleaning up model:', error)
            }
          }

          if (app) {
            try {
              app.destroy(true, {
                children: true,
                texture: true,
                baseTexture: true
              })
            } catch (error) {
              console.error('Error cleaning up PIXI application:', error)
            }
          }
        }

        setIsLoading(false)
      } catch (error) {
        setLoadError(`Failed to load model: ${String(error)}`)
        setIsLoading(false)

        // Try to clean up any partial resources
        if (appRef.current) {
          try {
            appRef.current.destroy(true, {
              children: true,
              texture: true,
              baseTexture: true
            })
            appRef.current = null
          } catch (cleanupError) {
            console.error('Error during cleanup after loading failure:', cleanupError)
          }
        }
      }
    }

    // Initialize the application
    initApp()

    // Cleanup function when unmounting
    return () => {
      if (cleanupFnRef.current) {
        cleanupFnRef.current()
        cleanupFnRef.current = null
      }
    }
  }, [modelPath])

  // Get the current window position when the hook is first used
  useEffect(() => {
    // Get initial window position
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.getWindowPosition(WINDOWS_ID.MAIN)
        .then((position) => {
          if (position) {
            initialWindowPositionRef.current = position;
            windowPositionRef.current = position;
          }
        })
        .catch((error) => {
          console.error('Failed to get window position:', error);
        });
    }
  }, []);

  // Handle mouse interactions for dragging
  useEffect(() => {
    // Start dragging when mouse is pressed on canvas
    const handleMouseDown = (e: MouseEvent) => {
      if (e.target === canvasRef.current) {
        isDraggingRef.current = true;

        // Store initial mouse position
        initialMousePositionRef.current = { x: e.screenX, y: e.screenY };

        // Get the latest window position when dragging starts
        window.electronAPI.getWindowPosition(WINDOWS_ID.MAIN)
          .then((position) => {
            if (position) {
              initialWindowPositionRef.current = position;
              windowPositionRef.current = position;
            }
          })
          .catch((error) => {
            console.error('Failed to get window position:', error);
          });

        // Ensure mouse events are forwarded
        window.electronAPI.toggleIgnoreMouseEvents({
          ignore: false,
          windowId: WINDOWS_ID.MAIN,
          forward: true
        });
      }
    };

    // Handle mouse movement - directly set window position based on mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      // Toggle mouse event forwarding based on whether mouse is over canvas
      if (e.target === canvasRef.current) {
        window.electronAPI.toggleIgnoreMouseEvents({
          ignore: false,
          windowId: WINDOWS_ID.MAIN,
          forward: true
        });
      } else {
        window.electronAPI.toggleIgnoreMouseEvents({
          ignore: true,
          windowId: WINDOWS_ID.MAIN,
          forward: true
        });
      }

      // If dragging, update window position directly based on mouse movement
      if (isDraggingRef.current) {
        // Calculate the mouse movement delta from the initial position
        const deltaX = e.screenX - initialMousePositionRef.current.x;
        const deltaY = e.screenY - initialMousePositionRef.current.y;
        
        // Calculate the new absolute window position
        const newX = initialWindowPositionRef.current.x + deltaX;
        const newY = initialWindowPositionRef.current.y + deltaY;
        
        // Update current window position
        windowPositionRef.current = { x: newX, y: newY };

        // Set the window position directly to follow mouse movement exactly
        // The main process will handle keeping the window within screen boundaries
        window.electronAPI.setWindowPosition({
          windowId: WINDOWS_ID.MAIN,
          x: newX,
          y: newY
        });
      }
    };

    // End dragging when mouse is released
    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;

        // Update initial window position for next drag operation
        initialWindowPositionRef.current = { ...windowPositionRef.current };
      }
    };

    // Add event listeners with passive option for better performance
    if (canvasRef.current) {
      window.addEventListener('mousedown', handleMouseDown, { passive: true });
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mouseup', handleMouseUp, { passive: true });
    }

    // Clean up event listeners
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [canvasRef.current]);

  return {
    isLoading,
    loadError,
    model: modelRef.current,
  }
}