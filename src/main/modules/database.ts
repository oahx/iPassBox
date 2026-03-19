import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import log from 'electron-log';
import type { PasswordEntry, AppSettings } from '../../shared/types';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const PBKDF2_ITERATIONS = 100000;

let derivedKey: Buffer | null = null;
let dataFilePath: string = '';
let authFilePath: string = '';
let entries: PasswordEntry[] = [];
let settings: AppSettings = { autoLockTimeout: 5, theme: 'light' };

function getDataPath(): string {
  return app.getPath('userData');
}

function initPaths(): void {
  const dataPath = getDataPath();
  dataFilePath = path.join(dataPath, 'vault.json');
  authFilePath = path.join(dataPath, 'auth.json');
}

const ENCRYPTED_VERSION = '1.0';

function loadData(): void {
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, 'utf8').trim();
      let data;
      
      if (content.startsWith('{') && content.includes('"version"')) {
        const parsed = JSON.parse(content);
        if (parsed.version && parsed.version.startsWith(ENCRYPTED_VERSION)) {
          throw new Error('Encrypted data but no key available');
        }
        data = parsed;
      } else if (content.includes(':')) {
        if (!derivedKey) {
          throw new Error('Encrypted data requires authentication');
        }
        const jsonData = decrypt(content);
        data = JSON.parse(jsonData);
      } else {
        throw new Error('Invalid data format');
      }
      
      entries = data.entries || [];
      settings = data.settings || { autoLockTimeout: 5, theme: 'light' };
    }
  } catch (error) {
    log.error('Failed to load data:', error);
    entries = [];
    settings = { autoLockTimeout: 5, theme: 'light' };
  }
}

function saveData(): void {
  try {
    const data = { version: ENCRYPTED_VERSION, entries, settings };
    const jsonData = JSON.stringify(data, null, 2);
    const encrypted = encrypt(jsonData);
    fs.writeFileSync(dataFilePath, encrypted);
  } catch (error) {
    log.error('Failed to save data:', error);
  }
}

function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
}

export function encrypt(plaintext: string): string {
  if (!derivedKey) {
    throw new Error('Encryption key not available');
  }
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

export function decrypt(ciphertext: string): string {
  if (!derivedKey) {
    throw new Error('Decryption key not available');
  }
  
  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid ciphertext format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export function initAuth(): void {
  initPaths();
  loadData();
  
  if (!fs.existsSync(authFilePath)) {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const authData = {
      salt: salt.toString('hex'),
      hash: '',
      initialized: false
    };
    fs.writeFileSync(authFilePath, JSON.stringify(authData, null, 2));
    log.info('Auth file created');
  }
}

export function checkFirstTime(): boolean {
  const authData = JSON.parse(fs.readFileSync(authFilePath, 'utf8'));
  return !authData.initialized;
}

export function setMasterPassword(password: string): boolean {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const hash = crypto.createHash('sha256').update(password + salt.toString('hex')).digest('hex');
  
  const authData = {
    salt: salt.toString('hex'),
    hash: hash,
    initialized: true
  };
  
  fs.writeFileSync(authFilePath, JSON.stringify(authData, null, 2));
  
  derivedKey = deriveKey(password, salt);
  
  log.info('Master password set');
  return true;
}

export function verifyMasterPassword(password: string): boolean {
  const authData = JSON.parse(fs.readFileSync(authFilePath, 'utf8'));
  
  const salt = Buffer.from(authData.salt, 'hex');
  const hash = crypto.createHash('sha256').update(password + salt.toString('hex')).digest('hex');
  
  if (hash === authData.hash) {
    derivedKey = deriveKey(password, salt);
    log.info('Master password verified');
    return true;
  }
  
  log.warn('Master password verification failed');
  return false;
}

export function changeMasterPassword(currentPassword: string, newPassword: string): boolean {
  const authData = JSON.parse(fs.readFileSync(authFilePath, 'utf8'));
  
  const currentSalt = Buffer.from(authData.salt, 'hex');
  const currentHash = crypto.createHash('sha256').update(currentPassword + currentSalt.toString('hex')).digest('hex');
  
  if (currentHash !== authData.hash) {
    log.warn('Current password verification failed');
    return false;
  }
  
  const newSalt = crypto.randomBytes(SALT_LENGTH);
  const newHash = crypto.createHash('sha256').update(newPassword + newSalt.toString('hex')).digest('hex');
  
  const newAuthData = {
    salt: newSalt.toString('hex'),
    hash: newHash,
    initialized: true
  };
  
  fs.writeFileSync(authFilePath, JSON.stringify(newAuthData, null, 2));
  
  derivedKey = deriveKey(newPassword, newSalt);
  
  saveData();
  
  log.info('Master password changed successfully');
  return true;
}

export function getKey(): Buffer | null {
  return derivedKey;
}

export function clearKey(): void {
  derivedKey = null;
  log.info('Encryption key cleared');
}

export function initDatabase(): void {
  loadData();
  log.info('Database initialized');
}

export function addEntry(entry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>): PasswordEntry {
  if (!derivedKey) {
    throw new Error('Not authenticated');
  }
  
  const id = uuidv4();
  const now = new Date().toISOString();
  
  const newEntry: PasswordEntry = {
    id,
    name: entry.name,
    url: entry.url || '',
    username: entry.username || '',
    password: entry.password,
    notes: entry.notes || '',
    category: entry.category || 'other',
    createdAt: now,
    updatedAt: now
  };
  
  entries.unshift(newEntry);
  saveData();
  
  log.info('Entry added');
  
  return newEntry;
}

export function updateEntry(entry: PasswordEntry): PasswordEntry {
  if (!derivedKey) {
    throw new Error('Not authenticated');
  }
  
  const now = new Date().toISOString();
  const updatedEntry = { ...entry, updatedAt: now };
  
  const index = entries.findIndex(e => e.id === entry.id);
  if (index !== -1) {
    entries[index] = updatedEntry;
    saveData();
  }
  
  log.info('Entry updated');
  
  return updatedEntry;
}

export function deleteEntry(id: string): boolean {
  if (!derivedKey) {
    throw new Error('Not authenticated');
  }
  
  const index = entries.findIndex(e => e.id === id);
  if (index !== -1) {
    entries.splice(index, 1);
    saveData();
    log.info('Entry deleted');
    return true;
  }
  
  return false;
}

export function getEntry(id: string): PasswordEntry | null {
  if (!derivedKey) {
    throw new Error('Not authenticated');
  }
  
  return entries.find(e => e.id === id) || null;
}

export function getAllEntries(): PasswordEntry[] {
  if (!derivedKey) {
    throw new Error('Not authenticated');
  }
  
  return entries.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function searchEntries(query: string): PasswordEntry[] {
  if (!derivedKey) {
    throw new Error('Not authenticated');
  }
  
  const lowerQuery = query.toLowerCase();
  return entries
    .filter(e => 
      e.name.toLowerCase().includes(lowerQuery) ||
      e.url.toLowerCase().includes(lowerQuery) ||
      e.username.toLowerCase().includes(lowerQuery)
    )
    .sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

export function getEntriesByCategory(category: string): PasswordEntry[] {
  if (!derivedKey) {
    throw new Error('Not authenticated');
  }
  
  return entries
    .filter(e => e.category === category)
    .sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

export function getSettings(): AppSettings {
  return settings;
}

export function setSettings(newSettings: Partial<AppSettings>): void {
  settings = { ...settings, ...newSettings };
  saveData();
  log.info('Settings updated');
}

export function exportData(filePath: string): boolean {
  if (!derivedKey) {
    throw new Error('Not authenticated');
  }
  
  const exportData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    entries
  };
  
  const jsonData = JSON.stringify(exportData, null, 2);
  const encrypted = encrypt(jsonData);
  
  fs.writeFileSync(filePath, encrypted);
  
  log.info('Data exported to:', filePath);
  return true;
}

export function exportDataAsJson(filePath: string): boolean {
  if (!derivedKey) {
    throw new Error('Not authenticated');
  }
  
  const exportData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    entries: entries.map(e => ({
      name: e.name,
      url: e.url,
      username: e.username,
      password: e.password,
      notes: e.notes,
      category: e.category,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt
    }))
  };
  
  const jsonData = JSON.stringify(exportData, null, 2);
  fs.writeFileSync(filePath, jsonData, 'utf8');
  
  log.info('Data exported as JSON to:', filePath);
  return true;
}

export function exportDataAsCsv(filePath: string): boolean {
  if (!derivedKey) {
    throw new Error('Not authenticated');
  }
  
  const headers = ['name', 'url', 'username', 'password', 'notes', 'category', 'createdAt', 'updatedAt'];
  const rows = entries.map(e => [
    `"${(e.name || '').replace(/"/g, '"')}"`,
    `"${(e.url || '').replace(/"/g, '"')}"`,
    `"${(e.username || '').replace(/"/g, '"')}"`,
    `"${(e.password || '').replace(/"/g, '"')}"`,
    `"${(e.notes || '').replace(/"/g, '"')}"`,
    `"${(e.category || '').replace(/"/g, '"')}"`,
    `"${e.createdAt || ''}"`,
    `"${e.updatedAt || ''}"`
  ].join(','));
  
  const csv = [headers.join(','), ...rows].join('\n');
  fs.writeFileSync(filePath, '\ufeff' + csv, 'utf8');
  
  log.info('Data exported as CSV to:', filePath);
  return true;
}

function generateId(): string {
  return crypto.randomUUID();
}

export function importDataFromJson(filePath: string): boolean {
  if (!derivedKey) {
    throw new Error('Not authenticated');
  }
  
  const jsonContent = fs.readFileSync(filePath, 'utf8');
  const importData = JSON.parse(jsonContent);
  
  for (const entry of importData.entries || []) {
    const newEntry: PasswordEntry = {
      id: generateId(),
      name: entry.name || '',
      url: entry.url || '',
      username: entry.username || '',
      password: entry.password || '',
      notes: entry.notes || '',
      category: entry.category || 'other',
      createdAt: entry.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const existingIndex = entries.findIndex(e => e.name === newEntry.name && e.username === newEntry.username);
    if (existingIndex !== -1) {
      entries[existingIndex] = newEntry;
    } else {
      entries.push(newEntry);
    }
  }
  
  saveData();
  log.info('Data imported from JSON:', filePath);
  return true;
}

export function importDataFromCsv(filePath: string): boolean {
  if (!derivedKey) {
    throw new Error('Not authenticated');
  }
  
  const csvContent = fs.readFileSync(filePath, 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV file is empty or invalid');
  }
  
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < headers.length) continue;
    
    const entry: Record<string, string> = {};
    headers.forEach((header, index) => {
      entry[header] = values[index] || '';
    });
    
    const newEntry: PasswordEntry = {
      id: generateId(),
      name: entry.name || '',
      url: entry.url || '',
      username: entry.username || '',
      password: entry.password || '',
      notes: entry.notes || '',
      category: entry.category || 'other',
      createdAt: entry.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const existingIndex = entries.findIndex(e => e.name === newEntry.name && e.username === newEntry.username);
    if (existingIndex !== -1) {
      entries[existingIndex] = newEntry;
    } else {
      entries.push(newEntry);
    }
  }
  
  saveData();
  log.info('Data imported from CSV:', filePath);
  return true;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  
  result.push(current);
  return result;
}

export function importData(filePath: string): boolean {
  if (!derivedKey) {
    throw new Error('Not authenticated');
  }
  
  const encrypted = fs.readFileSync(filePath, 'utf8');
  const jsonData = decrypt(encrypted);
  const importData = JSON.parse(jsonData);
  
  for (const entry of importData.entries) {
    const existingIndex = entries.findIndex(e => e.id === entry.id);
    if (existingIndex !== -1) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }
  }
  
  saveData();
  
  log.info('Data imported from:', filePath);
  return true;
}
