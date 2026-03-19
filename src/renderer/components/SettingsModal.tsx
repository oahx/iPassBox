import React, { useState, useEffect } from 'react';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';
import LanguageSelector from './LanguageSelector';
import type { AppSettings } from '@shared/types';
import './SettingsModal.css';

interface SettingsModalProps {
  onClose: () => void;
}

function SettingsModal({ onClose }: SettingsModalProps) {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<AppSettings>({
    autoLockTimeout: 5,
    theme: 'light'
  });
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await window.electronAPI.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeoutChange = async (timeout: number) => {
    try {
      const newSettings = { ...settings, autoLockTimeout: timeout };
      setSettings(newSettings);
      await window.electronAPI.setSettings({ autoLockTimeout: timeout });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError(t('settings.newPasswordMinLength'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t('settings.passwordsDoNotMatch'));
      return;
    }

    setChangingPassword(true);
    try {
      const success = await window.electronAPI.changeMasterPassword(currentPassword, newPassword);
      if (success) {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordForm(false);
      } else {
        setPasswordError(t('settings.currentPasswordIncorrect'));
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      setPasswordError(t('errors.generic'));
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content settings-modal" onClick={e => e.stopPropagation()}>
          <div className="settings-loading">{t('app.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('settings.title')}</h2>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3>{t('settings.language')}</h3>
            <div className="setting-item">
              <div className="setting-info">
                <label>{t('settings.languageDescription')}</label>
              </div>
              <LanguageSelector />
            </div>
          </div>

          <div className="settings-section">
            <h3>{t('settings.security')}</h3>
            
            <div className="setting-item">
              <div className="setting-info">
                <label>{t('settings.theme')}</label>
                <p>{t('settings.themeDescription')}</p>
              </div>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
              >
                <option value="light">{t('settings.themeLight')}</option>
                <option value="dark">{t('settings.themeDark')}</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>{t('settings.autoLockTimeout')}</label>
                <p>{t('settings.autoLockDescription')}</p>
              </div>
              <select
                value={settings.autoLockTimeout}
                onChange={(e) => handleTimeoutChange(Number(e.target.value))}
              >
                <option value={1}>1 minute</option>
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>{t('settings.changeMasterPassword')}</label>
                <p>{t('settings.changePasswordDescription')}</p>
              </div>
              <button 
                className="change-password-btn"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                {showPasswordForm ? t('settings.cancel') : t('settings.changePasswordBtn')}
              </button>
            </div>

            {showPasswordForm && (
              <div className="change-password-form">
                <div className="form-group">
                  <label>{t('settings.currentPassword')}</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t('settings.currentPasswordPlaceholder')}
                  />
                </div>
                <div className="form-group">
                  <label>{t('settings.newPassword')}</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('settings.newPasswordPlaceholder')}
                  />
                </div>
                <div className="form-group">
                  <label>{t('settings.confirmNewPassword')}</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('settings.confirmPasswordPlaceholder')}
                  />
                </div>
                {passwordError && <div className="error-message">{passwordError}</div>}
                {passwordSuccess && <div className="success-message">{t('settings.passwordChangedSuccess')}</div>}
                <button 
                  className="submit-btn"
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                >
                  {changingPassword ? t('settings.changing') : t('settings.confirmBtn')}
                </button>
              </div>
            )}
          </div>

          <div className="settings-section">
            <h3>{t('settings.about')}</h3>
            <div className="about-info">
              <div className="about-item">
                <span className="about-label">{t('settings.version')}</span>
                <span className="about-value">1.0.0</span>
              </div>
              <div className="about-item">
                <span className="about-label">{t('settings.encryption')}</span>
                <span className="about-value">AES-256-GCM</span>
              </div>
              <div className="about-item">
                <span className="about-label">{t('settings.dataStorage')}</span>
                <span className="about-value">{t('settings.dataStorage').includes('本地') ? '本地加密存储' : 'Local Encrypted Storage'}</span>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>{t('shortcuts.title')}</h3>
            <div className="shortcuts-list">
              <div className="shortcut-item">
                <span className="shortcut-action">{t('shortcuts.addNew')}</span>
                <kbd>Ctrl+N</kbd>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-action">{t('shortcuts.search')}</span>
                <kbd>Ctrl+F</kbd>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-action">{t('shortcuts.lock')}</span>
                <kbd>Ctrl+L</kbd>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-action">{t('shortcuts.settings')}</span>
                <kbd>Ctrl+,</kbd>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-action">{t('shortcuts.escape')}</span>
                <kbd>Esc</kbd>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>{t('settings.securityTips')}</h3>
            <div className="security-tips">
              <ul>
                <li>{t('settings.tip1')}</li>
                <li>{t('settings.tip2')}</li>
                <li>{t('settings.tip3')}</li>
                <li>{t('settings.tip4')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
