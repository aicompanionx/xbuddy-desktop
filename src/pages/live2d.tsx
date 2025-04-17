import React, { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { useAppStore } from '@/store/app';

// Lazy load the Live2DCharacter component
const Live2DCharacter = lazy(() => import('../components/features/live2d-character'));

const modelPath = `assets/live2d/hiyori_free_en/runtime/hiyori_free_t08.model3.json`

const Live2DPage: React.FC = () => {
  const { selectWindow } = useAppStore();
  const [windowId, setWindowId] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [componentKey, setComponentKey] = useState(Date.now());

  // Get window ID and update app state
  useEffect(() => {
    const cleanup = window.electronAPI.onWindowId((id) => {
      setWindowId(id);
      console.log('Live2D Window ID:', id);
      
      // Set current window as selectedWindow
      selectWindow(id);
    });
    
    return cleanup;
  }, [selectWindow]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Reset error state on resize
      setHasError(false);
      
      // Update window size
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
      
      // Generate new key to force component remount
      setComponentKey(Date.now());

      console.log('Window resized:', window.innerWidth, window.innerHeight);
    };

    // Add resize event listener
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX,
      y: e.clientY
    });
    
    // Prevent content selection during drag
    e.preventDefault();
  };

  // Handle drag movement
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    // Calculate movement delta
    const deltaX = e.clientX - dragOffset.x;
    const deltaY = e.clientY - dragOffset.y;
    
    // Update drag start coordinates
    setDragOffset({
      x: e.clientX,
      y: e.clientY
    });
    
    // Send window move message to main process
    window.electronAPI.sendMessageToWindow('main', 'move-live2d-window', {
      x: deltaX,
      y: deltaY,
      windowId
    });
  };

  // Handle drag end
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Ensure drag ends even outside window
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // Set transparent background for entire document
  useEffect(() => {
    // Set body and html background to transparent
    document.body.style.background = 'transparent';
    document.documentElement.style.background = 'transparent';
    
    // Ensure full screen styles
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.width = '100vw';
    document.body.style.height = '100vh';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.width = '100vw';
    document.documentElement.style.height = '100vh';
    
    // Force any parent containers to be full size
    const parentElements: HTMLElement[] = [];
    let parent = containerRef.current?.parentElement;
    while (parent && parent !== document.body) {
      parentElements.push(parent);
      parent = parent.parentElement;
    }
    
    parentElements.forEach(el => {
      if (el) {
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.margin = '0';
        el.style.padding = '0';
        el.style.overflow = 'hidden';
      }
    });
    
    // Ensure DOM is fully ready before rendering
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    
    return () => {
      // Cleanup function
      document.body.style.background = '';
      document.documentElement.style.background = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.width = '';
      document.documentElement.style.height = '';
      
      // Restore parent elements
      parentElements.forEach(el => {
        if (el) {
          el.style.width = '';
          el.style.height = '';
          el.style.margin = '';
          el.style.padding = '';
          el.style.overflow = '';
        }
      });
      
      clearTimeout(timer);
    };
  }, []);

  // Error handler function
  const handleError = () => {
    setHasError(true);
    console.error('Live2D rendering error occurred');
  };

  // Reset error state
  const resetError = () => {
    setHasError(false);
    setComponentKey(Date.now());
  };

  // Fallback content for error
  const ErrorFallback = () => (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-transparent">
      <div className="text-red-500 mb-4">Failed to load Live2D model</div>
      <button 
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={resetError}
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-transparent cursor-move flex items-center justify-center"
      style={{ 
        background: 'transparent',
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {isReady && (
        <Suspense fallback={<div className="w-full h-full bg-transparent" />}>
          {hasError ? (
            <ErrorFallback />
          ) : (
            <ErrorHandler onError={handleError} key={`error-handler-${componentKey}`}>
              <div className="w-full h-full flex items-center justify-center">
                <Live2DCharacter 
                  key={`live2d-${componentKey}`}
                  modelPath={modelPath}
                  width={windowSize.width}
                  height={windowSize.height}
                  centerModel={true}
                  fullscreen={true}
                  autoResize={true}
                />
              </div>
            </ErrorHandler>
          )}
        </Suspense>
      )}
    </div>
  );
};

// Functional error handler component
const ErrorHandler: React.FC<{
  children: React.ReactNode;
  onError: () => void;
}> = ({ children, onError }) => {
  useEffect(() => {
    // Error event handler
    const handleErrorEvent = (event: ErrorEvent) => {
      event.preventDefault();
      onError();
    };

    // Set up global error handler
    window.addEventListener('error', handleErrorEvent);
    
    return () => {
      window.removeEventListener('error', handleErrorEvent);
    };
  }, [onError]);

  // Use try-catch for synchronous errors in rendering
  try {
    return <>{children}</>;
  } catch (error) {
    onError();
    return null;
  }
};

export default Live2DPage;