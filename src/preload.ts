import { contextBridge } from 'electron';
import { electronAPI } from './lib/preload';

contextBridge.exposeInMainWorld('electronAPI', electronAPI); 