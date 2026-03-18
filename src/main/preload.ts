import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('app:ping'),
  checkFirstTime: () => ipcRenderer.invoke('auth:check-first-time'),
  setMasterPassword: (password: string) => ipcRenderer.invoke('auth:set-master-password', password),
  verifyMasterPassword: (password: string) => ipcRenderer.invoke('auth:verify-master-password', password),
  changeMasterPassword: (currentPassword: string, newPassword: string) => ipcRenderer.invoke('auth:change-master-password', currentPassword, newPassword),
  lock: () => ipcRenderer.invoke('auth:lock'),
  unlock: (password: string) => ipcRenderer.invoke('auth:unlock', password),
  
  addEntry: (entry: any) => ipcRenderer.invoke('db:add-entry', entry),
  updateEntry: (entry: any) => ipcRenderer.invoke('db:update-entry', entry),
  deleteEntry: (id: string) => ipcRenderer.invoke('db:delete-entry', id),
  getEntry: (id: string) => ipcRenderer.invoke('db:get-entry', id),
  getAllEntries: () => ipcRenderer.invoke('db:get-all-entries'),
  searchEntries: (query: string) => ipcRenderer.invoke('db:search-entries', query),
  getEntriesByCategory: (category: string) => ipcRenderer.invoke('db:get-entries-by-category', category),
  
  generatePassword: (options: any) => ipcRenderer.invoke('generator:generate', options),
  calculateStrength: (password: string) => ipcRenderer.invoke('generator:calculate-strength', password),
  
  exportData: () => ipcRenderer.invoke('backup:export'),
  importData: () => ipcRenderer.invoke('backup:import'),
  
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (settings: any) => ipcRenderer.invoke('settings:set', settings),
  
  onLocked: (callback: () => void) => {
    ipcRenderer.on('app:locked', callback);
    return () => ipcRenderer.removeListener('app:locked', callback);
  },
  
  reportActivity: () => ipcRenderer.send('app:activity')
});
