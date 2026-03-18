import React, { useState, useEffect } from 'react';
import { useI18n } from '../context/I18nContext';
import type { GenOptions } from '@shared/types';
import './GeneratorModal.css';

interface GeneratorModalProps {
  onClose: () => void;
}

function GeneratorModal({ onClose }: GeneratorModalProps) {
  const { t } = useI18n();
  const [options, setOptions] = useState<GenOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: true
  });
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generatePassword();
  }, []);

  useEffect(() => {
    const calculateStrength = async () => {
      if (password) {
        const result = await window.electronAPI.calculateStrength(password);
        setStrength(result);
      }
    };
    calculateStrength();
  }, [password]);

  const generatePassword = async () => {
    const newPassword = await window.electronAPI.generatePassword(options);
    setPassword(newPassword);
    setCopied(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUse = () => {
    navigator.clipboard.writeText(password);
    onClose();
  };

  const getStrengthLabel = () => {
    if (strength < 30) return t('password.weak');
    if (strength < 60) return t('password.fair');
    if (strength < 80) return t('password.good');
    return t('password.strong');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content generator-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('generator.title')}</h2>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="generator-content">
          <div className="generated-password">
            <input
              type="text"
              value={password}
              readOnly
              placeholder={t('generator.generated')}
            />
            <button className="copy-btn" onClick={handleCopy} title={t('generator.copy')}>
              {copied ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>

          <div className="strength-bar">
            <div className="strength-fill" style={{ width: `${strength}%` }}></div>
          </div>
          <div className="strength-label">
            {t('password.passwordStrength')}: {getStrengthLabel()} ({strength}%)
          </div>

          <div className="generator-options">
            <div className="option-row">
              <label>{t('generator.length')}</label>
              <div className="length-control">
                <input
                  type="range"
                  min="8"
                  max="64"
                  value={options.length}
                  onChange={(e) => setOptions({ ...options, length: Number(e.target.value) })}
                />
                <span>{options.length}</span>
              </div>
            </div>

            <div className="option-group">
              <label>{t('generator.options')}</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={options.uppercase}
                    onChange={(e) => setOptions({ ...options, uppercase: e.target.checked })}
                  />
                  <span>{t('generator.uppercase')}</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={options.lowercase}
                    onChange={(e) => setOptions({ ...options, lowercase: e.target.checked })}
                  />
                  <span>{t('generator.lowercase')}</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={options.numbers}
                    onChange={(e) => setOptions({ ...options, numbers: e.target.checked })}
                  />
                  <span>{t('generator.numbers')}</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={options.symbols}
                    onChange={(e) => setOptions({ ...options, symbols: e.target.checked })}
                  />
                  <span>{t('generator.symbols')}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="generator-actions">
            <button className="generate-btn" onClick={generatePassword}>
              {t('generator.generate')}
            </button>
            <button className="use-btn" onClick={handleUse}>
              {t('generator.use')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeneratorModal;
