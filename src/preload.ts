import { contextBridge } from 'electron'
import { electronAPI } from './service/preload'

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
