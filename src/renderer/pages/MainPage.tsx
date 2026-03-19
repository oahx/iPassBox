import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import Sidebar from '../components/Sidebar';
import PasswordList from '../components/PasswordList';
import PasswordDetail from '../components/PasswordDetail';
import AddEditModal from '../components/AddEditModal';
import SettingsModal from '../components/SettingsModal';
import GeneratorModal from '../components/GeneratorModal';
import type { PasswordEntry } from '@shared/types';
import './MainPage.css';

interface Category {
  id: string;
  name: string;
  icon: string;
}

function MainPage() {
  const { lock } = useAuth();
  const { t } = useI18n();
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<PasswordEntry | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const getCategories = (): Category[] => [
    { id: 'all', name: t('categories.all'), icon: '📁' },
    { id: 'social', name: t('categories.social'), icon: '👥' },
    { id: 'email', name: 'Email', icon: '📧' },
    { id: 'bank', name: t('categories.finance'), icon: '🏦' },
    { id: 'shopping', name: t('categories.shopping'), icon: '🛒' },
    { id: 'work', name: t('categories.work'), icon: '💼' },
    { id: 'entertainment', name: t('categories.entertainment'), icon: '🎮' },
    { id: 'other', name: t('categories.other'), icon: '📝' }
  ];

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            setShowAddModal(true);
            break;
          case 'f':
            e.preventDefault();
            document.querySelector<HTMLInputElement>('.search-box input')?.focus();
            break;
          case 'l':
            e.preventDefault();
            lock();
            break;
          case ',':
            e.preventDefault();
            setShowSettingsModal(true);
            break;
        }
      } else {
        if (e.key === 'Escape') {
          setShowAddModal(false);
          setShowSettingsModal(false);
          setShowGeneratorModal(false);
          setEditingEntry(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lock]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const data = await window.electronAPI.getAllEntries();
      setEntries(data);
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      if (searchQuery.trim()) {
        const results = await window.electronAPI.searchEntries(searchQuery);
        setEntries(selectedCategory === 'all' ? results : 
          results.filter(e => e.category === selectedCategory));
      } else if (selectedCategory !== 'all') {
        const results = await window.electronAPI.getEntriesByCategory(selectedCategory);
        setEntries(results);
      } else {
        loadEntries();
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleAddEntry = async (entry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newEntry = await window.electronAPI.addEntry(entry);
      setEntries(prev => [newEntry, ...prev]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add entry:', error);
    }
  };

  const handleUpdateEntry = async (entry: PasswordEntry) => {
    try {
      const updated = await window.electronAPI.updateEntry(entry);
      setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
      setSelectedEntry(updated);
      setEditingEntry(null);
    } catch (error) {
      console.error('Failed to update entry:', error);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await window.electronAPI.deleteEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      if (selectedEntry?.id === id) {
        setSelectedEntry(null);
      }
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const handleExport = async () => {
    try {
      const result = await window.electronAPI.exportData();
      if (result) {
        alert(t('backup.exportSuccess'));
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImport = async () => {
    try {
      const result = await window.electronAPI.importData();
      if (result) {
        alert(t('backup.importSuccess'));
        loadEntries();
      }
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  return (
    <div className="main-page">
      <Sidebar
        categories={getCategories()}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onLock={lock}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenGenerator={() => setShowGeneratorModal(true)}
        onExport={handleExport}
        onImport={handleImport}
      />
      
      <div className="main-content">
        <div className="content-header">
          <div className="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="add-button" onClick={() => setShowAddModal(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t('password.add')}
          </button>
        </div>

        <div className="content-body">
          <PasswordList
            entries={entries}
            selectedEntry={selectedEntry}
            loading={loading}
            onSelectEntry={setSelectedEntry}
            onEditEntry={setEditingEntry}
            onDeleteEntry={handleDeleteEntry}
          />

          <PasswordDetail
            entry={selectedEntry}
            onEdit={() => selectedEntry && setEditingEntry(selectedEntry)}
            onDelete={() => selectedEntry && handleDeleteEntry(selectedEntry.id)}
          />
        </div>
      </div>

      {showAddModal && (
        <AddEditModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddEntry}
          onOpenGenerator={() => setShowGeneratorModal(true)}
        />
      )}

      {editingEntry && (
        <AddEditModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={handleUpdateEntry}
          onOpenGenerator={() => setShowGeneratorModal(true)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}

      {showGeneratorModal && (
        <GeneratorModal onClose={() => setShowGeneratorModal(false)} />
      )}
    </div>
  );
}

export default MainPage;
