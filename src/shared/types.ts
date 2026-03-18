export interface PasswordEntry {
  id: string;
  name: string;
  url: string;
  username: string;
  password: string;
  notes: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface PasswordEntryDecrypted extends PasswordEntry {
  password: string;
}

export interface PasswordEntryEncrypted {
  id: string;
  name: string;
  url: string;
  username: string;
  password: string;
  notes: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeSimilar: boolean;
}

export interface AppSettings {
  autoLockTimeout: number;
  theme: 'light' | 'dark';
}

export interface AuthState {
  isAuthenticated: boolean;
  isLocked: boolean;
  isFirstTime: boolean;
}

export interface BackupData {
  version: string;
  exportedAt: string;
  entries: PasswordEntry[];
}

export interface IpcChannels {
  'auth:set-master-password': (password: string) => Promise<boolean>;
  'auth:verify-master-password': (password: string) => Promise<boolean>;
  'auth:check-first-time': () => Promise<boolean>;
  'auth:lock': () => Promise<void>;
  'auth:unlock': (password: string) => Promise<boolean>;
  
  'db:add-entry': (entry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PasswordEntry>;
  'db:update-entry': (entry: PasswordEntry) => Promise<PasswordEntry>;
  'db:delete-entry': (id: string) => Promise<boolean>;
  'db:get-entry': (id: string) => Promise<PasswordEntry | null>;
  'db:get-all-entries': () => Promise<PasswordEntry[]>;
  'db:search-entries': (query: string) => Promise<PasswordEntry[]>;
  'db:get-entries-by-category': (category: string) => Promise<PasswordEntry[]>;
  
  'generator:generate': (options: GenOptions) => Promise<string>;
  'generator:calculate-strength': (password: string) => Promise<number>;
  
  'backup:export': (filePath: string) => Promise<boolean>;
  'backup:import': (filePath: string) => Promise<boolean>;
  
  'settings:get': () => Promise<AppSettings>;
  'settings:set': (settings: Partial<AppSettings>) => Promise<void>;
}
