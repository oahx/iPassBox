import React from 'react';
import { useI18n } from '../context/I18nContext';
import './Sidebar.css';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface SidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  onLock: () => void;
  onOpenSettings: () => void;
  onOpenGenerator: () => void;
  onExport: () => void;
  onImport: () => void;
}

function Sidebar({ categories, selectedCategory, onSelectCategory, onLock, onOpenSettings, onOpenGenerator, onExport, onImport }: SidebarProps) {
  const { t } = useI18n();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <span className="sidebar-title">{t('app.title')}</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">{t('sidebar.categories')}</div>
          {categories.map(category => (
            <button
              key={category.id}
              className={`nav-item ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => onSelectCategory(category.id)}
            >
              <span className="nav-icon">{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        <div className="nav-section">
          <div className="nav-section-title">{t('sidebar.tools')}</div>
          <button className="nav-item" onClick={onOpenGenerator}>
            <span className="nav-icon">🎲</span>
            <span>{t('sidebar.passwordGenerator')}</span>
          </button>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">{t('sidebar.data')}</div>
          <button className="nav-item" onClick={onExport}>
            <span className="nav-icon">📤</span>
            <span>{t('sidebar.exportData')}</span>
          </button>
          <button className="nav-item" onClick={onImport}>
            <span className="nav-icon">📥</span>
            <span>{t('sidebar.importData')}</span>
          </button>
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item" onClick={onOpenSettings}>
          <span className="nav-icon">⚙️</span>
          <span>{t('sidebar.settings')}</span>
        </button>
        <button className="nav-item lock-btn" onClick={onLock}>
          <span className="nav-icon">🔒</span>
          <span>{t('sidebar.lock')}</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
