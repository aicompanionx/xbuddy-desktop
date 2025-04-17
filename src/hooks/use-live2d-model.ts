import { useRef, useState, useEffect, useCallback } from 'react'
import { Live2DModel } from 'pixi-live2d-display'

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
  updateModelSize: (newWidth: number, newHeight: number) => void
}

export function useLive2DModel({
  modelPath,
  width,
  height,
  canvasRef,
}: UseLive2DModelProps): UseLive2DModelReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState({ width, height })
  const appRef = useRef<PixiApp | null>(null)
  const modelRef = useRef<Live2DModel | null>(null)
  const cleanupFnRef = useRef<ModelCleanupFn | null>(null)
  // Dimension change flag
  const dimensionsChangedRef = useRef(false)

  // Function to update model size
  const updateModelSize = useCallback((newWidth: number, newHeight: number) => {
    // Don't update if the dimensions haven't actually changed
    if (dimensions.width === newWidth && dimensions.height === newHeight) {
      return
    }
    
    console.log('Updating dimensions:', newWidth, newHeight)
    setDimensions({ width: newWidth, height: newHeight })
    dimensionsChangedRef.current = true
    
    // If the app has been created, update its dimensions
    if (appRef.current && appRef.current.renderer) {
      try {
        appRef.current.renderer.resize(newWidth, newHeight)
        
        // If the model is loaded, adjust its position and scale
        if (modelRef.current) {
          try {
            // Center the model in the canvas
            safeSetModelPosition(modelRef.current, newWidth / 2, newHeight / 2)
            
            // Calculate the optimal scale for the model to fit in the canvas
            // Increase the scale factor for better visibility
            safeSetModelScale(modelRef.current, 0.1)
          } catch (error) {
            console.error('Error updating model size:', error)
          }
        }
      } catch (error) {
        console.error('Error resizing renderer:', error)
      }
    }
  }, [dimensions, width, height])

  // Helper function for safely setting model position
  const safeSetModelPosition = (model: any, x: number, y: number) => {
    if (!model) return
    
    try {
      // Check if position property exists before directly setting
      if (model.position) {
        model.position.x = x
        model.position.y = y
      } else {
        // Use x/y properties if position doesn't exist
        model.x = x
        model.y = y
      }
    } catch (error) {
      console.error('Error setting model position:', error)
    }
  }
  
  // Helper function for safely setting model scale
  const safeSetModelScale = (model: any, scale: number) => {
    if (!model) return
    
    try {
      // Similarly check the scale property
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

  // Effect just for updating canvas size
  useEffect(() => {
    // If canvas exists, update its dimensions
    if (canvasRef.current) {
      try {
        canvasRef.current.width = dimensions.width
        canvasRef.current.height = dimensions.height
      } catch (error) {
        console.error('Error updating canvas dimensions:', error)
      }
    }
    
    // If the app has been created, update renderer dimensions
    if (appRef.current && appRef.current.renderer) {
      try {
        appRef.current.renderer.resize(dimensions.width, dimensions.height)
        
        // If the model is loaded, adjust model position
        if (modelRef.current) {
          try {
            // Center the model in the canvas
            safeSetModelPosition(modelRef.current, dimensions.width / 2, dimensions.height / 2)
            
            safeSetModelScale(modelRef.current, 0.1)
          } catch (error) {
            console.error('Error updating model position:', error)
          }
        }
      } catch (error) {
        console.error('Error updating renderer dimensions:', error)
      }
    }
  }, [dimensions, width, height])

  // Effect only for loading the model, to reduce reloading
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

    const initApp = async () => {
      try {
        // Create canvas with explicit dimensions
        const canvas = canvasRef.current
        if (!canvas) return

        try {
          // Create PIXI app - use standard parameters
          // @ts-expect-error - Type definitions don't match actual usage
          const app = new PIXI.Application({
            width: dimensions.width,
            height: dimensions.height,
            transparent: true,
            view: canvas,
            forceWebGL: true,
            autoDensity: true,
            resolution: window.devicePixelRatio * 2,
          })

          console.log('PIXI application created successfully')

          // Save to ref
          appRef.current = app

          try {
            // Load model - using direct Live2DModel call method
            setIsLoading(true)
            setLoadError(null)

            console.log('Attempting to load model:', modelPath)

            try {
              // Try checking if file exists using fetch
              const response = await fetch(modelPath)
              if (!response.ok) {
                throw new Error(`Model file doesn't exist or can't be accessed: ${response.status}`)
              }

              console.log('Model file exists, starting load')

              // Use standard method to load model, avoid array index access errors
              // @ts-expect-error - Type definitions don't match actual usage
              const model = await Live2DModel.from(modelPath, {
                autoInteract: false, // Avoid interaction handler errors
                autoUpdate: true, // Allow automatic updates
              })

              console.log('Model loaded successfully')

              if (!app || !app.stage) {
                throw new Error('PIXI application or stage does not exist')
              }

              // Setup model properties
              setupModel(model, app)

              // Set up render loop
              const cleanupTicker = setupTicker(model, app)
              
              // Comprehensive cleanup function
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
            } catch (error) {
              console.error('Live2DModel.from loading failed:', error)
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
              return
            }
          } catch (error) {
            console.error('Error during model loading process:', error)
            setLoadError(`Model loading process error: ${String(error)}`)
            setIsLoading(false)
            return
          }
        } catch (error) {
          console.error('Error creating PIXI application:', error)
          setLoadError(`PIXI application creation failed: ${String(error)}`)
          setIsLoading(false)
          return
        }
      } catch (error) {
        console.error('General init error:', error)
        setLoadError(`Initialization error: ${String(error)}`)
        setIsLoading(false)
      }
    }

    // Setup the model with appropriate properties
    const setupModel = (model: Live2DModel, app: any) => {
      try {
        // Save model reference
        modelRef.current = model
        
        // Center the model in the canvas
        safeSetModelPosition(model, dimensions.width / 2, dimensions.height / 2)
        
        // Use a smaller initial scale to ensure full model visibility
        safeSetModelScale(model, 0.1);
        
        // Log scale for debugging
        
        // Add model to stage
        app.stage.addChild(model)
        
        // Force model to be centered in canvas
        model.anchor.set(0.5, 0.5);
        
        // Model successfully loaded
        setIsLoading(false)
      } catch (error) {
        console.error('Error setting up model:', error)
        setLoadError(`Failed to setup model: ${String(error)}`)
        setIsLoading(false)
      }
    }

    // Setup the animation ticker
    const setupTicker = (model: Live2DModel, app: any) => {
      try {
        // Create animation loop
        const animate = () => {
          try {
            // Ensure model stays centered
            if (modelRef.current) {
              safeSetModelPosition(modelRef.current, dimensions.width / 2, dimensions.height / 2)
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

    // Initialize the application
    initApp()
    
    // Cleanup function when unmounting
    return () => {
      if (cleanupFnRef.current) {
        cleanupFnRef.current()
        cleanupFnRef.current = null
      }
    }
  }, [modelPath, dimensions])

  return {
    isLoading,
    loadError,
    model: modelRef.current,
    updateModelSize,
  }
} 