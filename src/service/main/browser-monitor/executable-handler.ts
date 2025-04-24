import { app } from 'electron'
import { spawn, exec } from 'child_process'
import path from 'path'
import os from 'os'
import fs from 'fs'

/**
 * Make file executable (for non-Windows platforms)
 * @param filePath Path to executable file
 */
export const makeExecutable = async (filePath: string): Promise<void> => {
  if (process.platform === 'win32') return

  return new Promise((resolve, reject) => {
    exec(`chmod +x "${filePath}"`, (error) => {
      if (error) {
        console.warn(`Failed to make file executable: ${error.message}`)
        // Continue anyway, it might already be executable
      }
      resolve()
    })
  })
}

/**
 * Get executable path based on platform
 * @returns Object containing executable path and args
 */
export const getMonitorExecutablePath = (): { execPath: string; args: string[] } => {
  const platform = os.platform()

  // Determine base path for the executable
  const basePath = app.isPackaged ? path.dirname(app.getAppPath()) : app.getAppPath()

  const binPath = path.join(basePath, 'src', 'service', 'bin')
  let execPath: string
  const args: string[] = []

  // Python script path (for fallback)
  const pythonScriptPath = path.join(binPath, 'browser_monitor.py')

  if (platform === 'win32') {
    execPath = path.join(binPath, 'browser_monitor.exe')
    // Fallback to Python for development
    if (!fs.existsSync(execPath)) {
      console.log('Binary not found, falling back to Python script')
      execPath = 'python'
      args.push(pythonScriptPath)
    }
  } else if (platform === 'darwin') {
    execPath = path.join(binPath, 'browser_monitor')
    // Fallback to Python for development
    if (!fs.existsSync(execPath)) {
      console.log('Binary not found, falling back to Python script')
      execPath = 'python3'
      args.push(pythonScriptPath)
    }
  } else if (platform === 'linux') {
    execPath = path.join(binPath, 'browser_monitor')
    // Fallback to Python for development
    if (!fs.existsSync(execPath)) {
      console.log('Binary not found, falling back to Python script')
      execPath = 'python3'
      args.push(pythonScriptPath)
    }
  } else {
    throw new Error(`Unsupported operating system: ${platform}`)
  }

  console.log(`Monitor path: ${execPath}, args: ${args.join(' ')}`)
  return { execPath, args }
}
