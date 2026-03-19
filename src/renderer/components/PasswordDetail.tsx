import React, { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import type { PasswordEntry } from '@shared/types';
import { copyToClipboard } from '../utils/clipboard';
import './PasswordDetail.css';

interface PasswordDetailProps {
  entry: PasswordEntry | null;
  onEdit: () => void;
  onDelete: () => void;
}

function PasswordDetail({ entry, onEdit, onDelete }: PasswordDetailProps) {
  const { t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const getCategoryName = (category: string) => {
    const key = `categories.${category}`;
    const translated = t(key);
    return translated === key ? category : translated;
  };

  if (!entry) {
    return (
      <div className="password-detail">
        <div className="detail-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <p>{t('password.selectPassword') || 'Select a password to view details'}</p>
        </div>
      </div>
    );
  }

  const handleCopy = async (text: string, field: string) => {
    await copyToClipboard(text, () => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="password-detail">
      <div className="detail-header">
        <h2>{entry.name}</h2>
        <div className="detail-actions">
          <button className="detail-btn edit" onClick={onEdit}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            {t('password.edit')}
          </button>
          <button className="detail-btn delete" onClick={onDelete}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            {t('password.delete')}
          </button>
        </div>
      </div>

      <div className="detail-content">
        {entry.url && (
          <div className="detail-field">
            <label>{t('password.url')}</label>
            <div className="field-value">
              <span className="value-text">{entry.url}</span>
              <button className="copy-btn" onClick={() => handleCopy(entry.url!, 'url')}>
                {copiedField === 'url' ? t('password.copied') : t('password.copyPassword').replace('Copy ', '')}
              </button>
            </div>
          </div>
        )}

        <div className="detail-field">
          <label>{t('password.username')}</label>
          <div className="field-value">
            <span className="value-text">{entry.username || '-'}</span>
            <button className="copy-btn" onClick={() => handleCopy(entry.username!, 'username')}>
              {copiedField === 'username' ? t('password.copied') : t('password.copyUsername').replace('Copy ', '')}
            </button>
          </div>
        </div>

        <div className="detail-field">
          <label>{t('password.passwordField')}</label>
          <div className="field-value password-field">
            <span className="value-text mono">
              {showPassword ? entry.password : '••••••••••••'}
            </span>
            <div className="password-actions">
              <button className="toggle-btn" onClick={() => setShowPassword(!showPassword)}>
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
              <button className="copy-btn" onClick={() => handleCopy(entry.password, 'password')}>
                {copiedField === 'password' ? t('password.copied') : t('password.copyPassword').replace('Copy ', '')}
              </button>
            </div>
          </div>
        </div>

        {entry.notes && (
          <div className="detail-field">
            <label>{t('password.notes')}</label>
            <div className="field-value notes">
              <span className="value-text">{entry.notes}</span>
            </div>
          </div>
        )}

        <div className="detail-field">
          <label>{t('password.category')}</label>
          <div className="field-value">
            <span className="category-tag">{getCategoryName(entry.category)}</span>
          </div>
        </div>

        <div className="detail-meta">
          <span>{t('password.created')}: {formatDate(entry.createdAt)}</span>
          <span>{t('password.lastModified')}: {formatDate(entry.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}

export default PasswordDetail;
