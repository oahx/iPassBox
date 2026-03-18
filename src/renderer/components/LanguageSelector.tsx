import React from 'react';
import { useI18n } from '../context/I18nContext';
import './LanguageSelector.css';

interface LanguageSelectorProps {
  compact?: boolean;
}

function LanguageSelector({ compact = false }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className={`language-selector ${compact ? 'compact' : ''}`}>
      {!compact && <label>{t('settings.language')}</label>}
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'zh')}
      >
        <option value="en">English</option>
        <option value="zh">中文</option>
      </select>
    </div>
  );
}

export default LanguageSelector;
