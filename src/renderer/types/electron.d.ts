import type { PasswordEntry, GenOptions, AppSettings } from '@shared/types';

export interface ElectronAPI {
  ping: () => Promise<string>;
  checkFirstTime: () => Promise<boolean>;
  setMasterPassword: (password: string) => Promise<boolean>;
  verifyMasterPassword: (password: string) => Promise<boolean>;
  changeMasterPassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  lock: () => Promise<void>;
  unlock: (password: string) => Promise<boolean>;
  
  addEntry: (entry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PasswordEntry>;
  updateEntry: (entry: PasswordEntry) => Promise<PasswordEntry>;
  deleteEntry: (id: string) => Promise<boolean>;
  getEntry: (id: string) => Promise<PasswordEntry | null>;
  getAllEntries: () => Promise<PasswordEntry[]>;
  searchEntries: (query: string) => Promise<PasswordEntry[]>;
  getEntriesByCategory: (category: string) => Promise<PasswordEntry[]>;
  
  generatePassword: (options: GenOptions) => Promise<string>;
  calculateStrength: (password: string) => Promise<number>;
  
  exportData: () => Promise<boolean>;
  importData: () => Promise<boolean>;
  
  getSettings: () => Promise<AppSettings>;
  setSettings: (settings: Partial<AppSettings>) => Promise<void>;
  
  onLocked: (callback: () => void) => () => void;
  reportActivity: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
