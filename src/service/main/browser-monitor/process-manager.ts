import { BrowserWindow } from 'electron'
import { spawn, ChildProcess, SpawnOptions } from 'child_process'
import { getMonitorExecutablePath, makeExecutable } from './executable-handler'
import { processMonitorData, resetDataBuffer } from './data-processor'

// Monitor process reference
let monitorProcess: ChildProcess | null = null

/**
 * Check if monitor process is running
 */
export const isProcessRunning = (): boolean => {
  return monitorProcess !== null
}

/**
 * Start monitor process
 * @param mainWindow Main window reference
 * @param onProcessExit Callback for when process exits
 */
export const startMonitorProcess = async (
  mainWindow: BrowserWindow | null,
  onProcessExit: (code: number | null) => void,
): Promise<{ success: boolean; message: string }> => {
  try {
    // Get the monitor program path and args
    const { execPath, args } = getMonitorExecutablePath()

    console.log("execPath", execPath);
    console.log("args", args);

    // If we're not using Python fallback and on non-Windows, ensure file is executable
    if (!execPath.includes('python') && process.platform !== 'win32') {
      await makeExecutable(execPath)
    }

    // Set environment variables and options
    const options: SpawnOptions = {
      env: { ...process.env, PYTHONUNBUFFERED: '1' },
      stdio: ['pipe', 'pipe', 'pipe'],
    }

    // Start the monitoring process
    monitorProcess = spawn(execPath, args, options)

    // Reset data buffer
    resetDataBuffer()

    // Set up data reception
    monitorProcess.stdout?.on('data', (data) => {
      processMonitorData(data, mainWindow)
    })

    // Error handling
    monitorProcess.stderr?.on('data', (data) => {
      console.error('Browser monitor error:', data.toString())
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('browser-monitor-data', {
          error: true,
          message: data.toString(),
        })
      }
    })

    // Process error handling
    monitorProcess.on('error', (error) => {
      console.error(`Process start error: ${error.message}`)
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('browser-monitor-data', {
          error: true,
          message: `Failed to start monitor: ${error.message}`,
        })
      }
    })

    // Listen for process exit
    monitorProcess.on('close', (code) => {
      console.log(`Browser monitor process exited with code: ${code}`)
      monitorProcess = null
      onProcessExit(code)
    })

    return { success: true, message: 'Browser monitoring started successfully' }
  } catch (error) {
    console.error('Failed to start browser monitoring:', error)
    return {
      success: false,
      message: `Failed to start browser monitoring: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * Stop monitor process
 */
export const stopMonitorProcess = async (): Promise<{ success: boolean; message: string }> => {
  if (!monitorProcess) {
    return { success: true, message: 'Browser monitoring is not running' }
  }

  try {
    // On Windows, use taskkill to ensure child processes are terminated
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(monitorProcess.pid), '/f', '/t'])
    } else {
      // On macOS/Linux, use kill signal
      monitorProcess.kill('SIGTERM')

      // If the process hasn't exited after a period, force kill it
      setTimeout(() => {
        if (monitorProcess && !monitorProcess.killed) {
          monitorProcess.kill('SIGKILL')
        }
      }, 2000)
    }

    // Clear reference soon (actual process may take time to exit)
    const processRef = monitorProcess
    monitorProcess = null

    // Return success even though process may still be shutting down
    return { success: true, message: 'Browser monitoring stopped' }
  } catch (error) {
    console.error('Failed to stop browser monitoring:', error)
    // Clear reference even if there was an error
    monitorProcess = null
    return {
      success: false,
      message: `Failed to stop browser monitoring: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
