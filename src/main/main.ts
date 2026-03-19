import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import * as path from 'path';
import log from 'electron-log';
import { initDatabase, addEntry, updateEntry, deleteEntry, getEntry, getAllEntries, searchEntries, getEntriesByCategory, initAuth, checkFirstTime, setMasterPassword, verifyMasterPassword, changeMasterPassword, getSettings, setSettings, clearKey, getKey, exportData, importData, exportDataAsJson, exportDataAsCsv, importDataFromJson, importDataFromCsv } from './modules/database';
import { generatePassword, calculateStrength } from './modules/generator';

app.setName('iPassBox');

log.initialize({ preload: true });
log.transports.file.level = 'error';
log.transports.console.level = false;
log.info('Application starting...');

let mainWindow: BrowserWindow | null = null;
let autoLockTimer: NodeJS.Timeout | null = null;

function createWindow() {
  const isDev = !app.isPackaged;
  
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    center: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    show: false,
    backgroundColor: '#F8FAFC'
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    log.info('Main window displayed');
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  resetAutoLockTimer();
}

function resetAutoLockTimer() {
  if (autoLockTimer) {
    clearTimeout(autoLockTimer);
  }
  
  const settings = getSettings();
  const timeout = settings?.autoLockTimeout || 5;
  
  autoLockTimer = setTimeout(() => {
    if (mainWindow && getKey()) {
      clearKey();
      mainWindow.webContents.send('app:locked');
      log.info('Auto-locked due to inactivity');
    }
  }, timeout * 60 * 1000);
}

function setupIpcHandlers() {
  ipcMain.handle('app:ping', async () => {
    log.info('IPC ping received');
    return 'pong';
  });

  ipcMain.handle('auth:check-first-time', async () => {
    return checkFirstTime();
  });

  ipcMain.handle('auth:set-master-password', async (_, password: string) => {
    try {
      log.info('Setting master password...');
      setMasterPassword(password);
      log.info('Master password set successfully');
      return true;
    } catch (error) {
      log.error('Error setting master password:', error);
      throw error;
    }
  });

  ipcMain.handle('auth:verify-master-password', async (_, password: string) => {
    return verifyMasterPassword(password);
  });

  ipcMain.handle('auth:change-master-password', async (_, currentPassword: string, newPassword: string) => {
    return changeMasterPassword(currentPassword, newPassword);
  });

  ipcMain.handle('auth:lock', async () => {
    clearKey();
    return;
  });

  ipcMain.handle('auth:unlock', async (_, password: string) => {
    const result = verifyMasterPassword(password);
    if (result) {
      resetAutoLockTimer();
    }
    return result;
  });

  ipcMain.handle('db:add-entry', async (_, entry) => {
    resetAutoLockTimer();
    return addEntry(entry);
  });

  ipcMain.handle('db:update-entry', async (_, entry) => {
    resetAutoLockTimer();
    return updateEntry(entry);
  });

  ipcMain.handle('db:delete-entry', async (_, id: string) => {
    resetAutoLockTimer();
    return deleteEntry(id);
  });

  ipcMain.handle('db:get-entry', async (_, id: string) => {
    return getEntry(id);
  });

  ipcMain.handle('db:get-all-entries', async () => {
    resetAutoLockTimer();
    return getAllEntries();
  });

  ipcMain.handle('db:search-entries', async (_, query: string) => {
    resetAutoLockTimer();
    return searchEntries(query);
  });

  ipcMain.handle('db:get-entries-by-category', async (_, category: string) => {
    resetAutoLockTimer();
    return getEntriesByCategory(category);
  });

  ipcMain.handle('generator:generate', async (_, options) => {
    return generatePassword(options);
  });

  ipcMain.handle('generator:calculate-strength', async (_, password: string) => {
    return calculateStrength(password);
  });

  ipcMain.handle('backup:export', async () => {
    try {
      const desktopPath = app.getPath('desktop');
      const result = await dialog.showSaveDialog(mainWindow!, {
        title: '导出密码数据',
        defaultPath: path.join(desktopPath, 'ipassbox-backup.vault'),
        filters: [
          { name: 'Vault Backup (Encrypted)', extensions: ['vault'] },
          { name: 'JSON (Unencrypted)', extensions: ['json'] },
          { name: 'CSV (Unencrypted)', extensions: ['csv'] }
        ]
      });
      
      if (!result.canceled && result.filePath) {
        resetAutoLockTimer();
        const ext = path.extname(result.filePath).toLowerCase();
        if (ext === '.json') {
          return exportDataAsJson(result.filePath);
        } else if (ext === '.csv') {
          return exportDataAsCsv(result.filePath);
        } else {
          return exportData(result.filePath);
        }
      }
      return false;
    } catch (error) {
      log.error('Export error:', error);
      return false;
    }
  });

  ipcMain.handle('backup:import', async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow!, {
        title: '导入密码数据',
        filters: [
          { name: 'Vault Backup', extensions: ['vault'] },
          { name: 'JSON', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      });
      
      if (!result.canceled && result.filePaths[0]) {
        resetAutoLockTimer();
        const filePath = result.filePaths[0];
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.json') {
          return importDataFromJson(filePath);
        } else if (ext === '.csv') {
          return importDataFromCsv(filePath);
        } else {
          return importData(filePath);
        }
      }
      return false;
    } catch (error) {
      log.error('Import error:', error);
      return false;
    }
  });

  ipcMain.handle('settings:get', async () => {
    return getSettings();
  });

  ipcMain.handle('settings:set', async (_, settings) => {
    setSettings(settings);
    resetAutoLockTimer();
    return;
  });

  ipcMain.on('app:activity', () => {
    resetAutoLockTimer();
  });
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  try {
    initAuth();
    initDatabase();
    setupIpcHandlers();
    createWindow();
    log.info('Application initialized successfully');
  } catch (error) {
    log.error('Failed to initialize application:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

process.on('uncaughtException', (error) => {
  log.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled rejection:', reason);
});
