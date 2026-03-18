import React, { useState, useEffect } from 'react';
import { useI18n } from '../context/I18nContext';
import type { PasswordEntry, GenOptions } from '@shared/types';
import './AddEditModal.css';

interface AddEditModalProps {
  entry?: PasswordEntry | null;
  onClose: () => void;
  onSave: (entry: any) => void;
  onOpenGenerator: () => void;
}

function AddEditModal({ entry, onClose, onSave, onOpenGenerator }: AddEditModalProps) {
  const { t } = useI18n();
  const [name, setName] = useState(entry?.name || '');
  const [url, setUrl] = useState(entry?.url || '');
  const [username, setUsername] = useState(entry?.username || '');
  const [password, setPassword] = useState(entry?.password || '');
  const [notes, setNotes] = useState(entry?.notes || '');
  const [category, setCategory] = useState(entry?.category || 'other');
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const calculateStrength = async () => {
      if (password) {
        const result = await window.electronAPI.calculateStrength(password);
        setStrength(result);
      } else {
        setStrength(0);
      }
    };
    calculateStrength();
  }, [password]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = t('errors.generic');
    }
    if (!password) {
      newErrors.password = t('errors.generic');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const entryData = {
      name: name.trim(),
      url: url.trim(),
      username: username.trim(),
      password,
      notes: notes.trim(),
      category
    };

    if (entry) {
      onSave({ ...entryData, id: entry.id, createdAt: entry.createdAt });
    } else {
      onSave(entryData);
    }
  };

  const getStrengthColor = () => {
    if (strength <= 25) return '#EF4444';
    if (strength <= 50) return '#F59E0B';
    if (strength <= 75) return '#3B82F6';
    return '#10B981';
  };

  const getStrengthLabel = () => {
    if (strength <= 25) return t('password.weak');
    if (strength <= 50) return t('password.fair');
    if (strength <= 75) return t('password.good');
    return t('password.strong');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{entry ? t('password.edit') : t('password.add')}</h2>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">{t('password.name')} <span className="required">*</span></label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('password.namePlaceholder')}
              autoFocus
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="url">{t('password.url')}</label>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t('password.urlPlaceholder')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">{t('password.username')}</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('password.usernamePlaceholder')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('password.passwordField')} <span className="required">*</span></label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('password.passwordPlaceholder')}
                className="mono"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                className="generator-btn"
                onClick={onOpenGenerator}
                title={t('password.generatePassword')}
              >
                🎲
              </button>
            </div>
            {password && (
              <div className="strength-indicator">
                <div className="strength-bar">
                  <div 
                    className="strength-fill" 
                    style={{ 
                      width: `${strength}%`,
                      backgroundColor: getStrengthColor()
                    }}
                  />
                </div>
                <span className="strength-label" style={{ color: getStrengthColor() }}>
                  {getStrengthLabel()} ({strength}%)
                </span>
              </div>
            )}
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">{t('password.category')}</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="social">{t('categories.social')}</option>
              <option value="email">Email</option>
              <option value="bank">{t('categories.finance')}</option>
              <option value="shopping">{t('categories.shopping')}</option>
              <option value="work">{t('categories.work')}</option>
              <option value="entertainment">{t('categories.entertainment')}</option>
              <option value="other">{t('categories.other')}</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notes">{t('password.notes')}</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('password.notesPlaceholder')}
              rows={3}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t('password.cancel')}
            </button>
            <button type="submit" className="btn-primary">
              {entry ? t('password.save') : t('password.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEditModal;
