import React from 'react';
import { useI18n } from '../context/I18nContext';
import type { PasswordEntry } from '@shared/types';
import './PasswordList.css';

interface PasswordListProps {
  entries: PasswordEntry[];
  selectedEntry: PasswordEntry | null;
  loading: boolean;
  onSelectEntry: (entry: PasswordEntry) => void;
  onEditEntry: (entry: PasswordEntry) => void;
  onDeleteEntry: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  social: '👥',
  email: '📧',
  bank: '🏦',
  shopping: '🛒',
  work: '💼',
  entertainment: '🎮',
  other: '📝'
};

function PasswordList({ entries, selectedEntry, loading, onSelectEntry, onEditEntry, onDeleteEntry }: PasswordListProps) {
  const { t } = useI18n();

  const handleContextMenu = (e: React.MouseEvent, entry: PasswordEntry) => {
    e.preventDefault();
  };

  if (loading) {
    return (
      <div className="password-list">
        <div className="list-loading">
          <div className="loading-spinner"></div>
          <p>{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="password-list">
        <div className="list-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <p>{t('search.noPasswords')}</p>
          <span>{t('search.addFirst')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="password-list">
      <div className="list-header">
        <span>{entries.length} {entries.length === 1 ? 'item' : 'items'}</span>
      </div>
      <div className="list-items">
        {entries.map(entry => (
          <div
            key={entry.id}
            className={`list-item ${selectedEntry?.id === entry.id ? 'selected' : ''}`}
            onClick={() => onSelectEntry(entry)}
            onContextMenu={(e) => handleContextMenu(e, entry)}
          >
            <div className="item-icon">
              {CATEGORY_ICONS[entry.category] || '📝'}
            </div>
            <div className="item-content">
              <div className="item-title">{entry.name}</div>
              <div className="item-subtitle">{entry.username}</div>
            </div>
            <div className="item-actions">
              <button
                className="action-btn"
                onClick={(e) => { e.stopPropagation(); onEditEntry(entry); }}
                title={t('password.edit')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                className="action-btn delete"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (confirm(t('password.confirmDelete'))) {
                    onDeleteEntry(entry.id);
                  }
                }}
                title={t('password.delete')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PasswordList;
