import { useState, useMemo } from 'react';
import type { Certification } from '../certifications/registry';
import type { AppSettings } from '../types';
import { useData } from '../hooks/useData';
import { useExam } from '../hooks/useExam';
import { certStorage } from '../utils/storage';
import { HomePage } from './HomePage';
import { ExamPage } from './ExamPage';
import { HistoryPage } from './HistoryPage';
import { SettingsPage } from './SettingsPage';

type AppView = 'home' | 'exam' | 'history' | 'settings';

interface Props {
  cert: Certification;
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  onBackToCertifications: () => void;
}

export function CertificationApp({ cert, settings, updateSettings, onBackToCertifications }: Props) {
  const [view, setView] = useState<AppView>('home');
  const { indexData, questionsByChapter, loading, error } = useData(cert.id);
  const storage = useMemo(() => certStorage(cert.storagePrefix), [cert.storagePrefix]);
  const examHook = useExam(indexData, questionsByChapter, settings, storage);

  // If exam is in progress, show exam page
  const activeView = examHook.examState !== null ? 'exam' : view;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Loading question bank...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <p className="text-red-500">Error loading data: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {activeView !== 'exam' && (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <button
            onClick={() => setView('home')}
            className="text-lg font-bold text-blue-600 dark:text-blue-400 hover:opacity-80"
          >
            {cert.shortTitle}
          </button>
          <nav className="flex gap-4 text-sm font-medium">
            <button
              onClick={onBackToCertifications}
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              All certifications
            </button>
            <button
              onClick={() => setView('history')}
              className={`hover:text-blue-600 dark:hover:text-blue-400 ${view === 'history' ? 'text-blue-600 dark:text-blue-400' : ''}`}
            >
              History
            </button>
            <button
              onClick={() => setView('settings')}
              className={`hover:text-blue-600 dark:hover:text-blue-400 ${view === 'settings' ? 'text-blue-600 dark:text-blue-400' : ''}`}
            >
              Settings
            </button>
          </nav>
        </header>
      )}

      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeView === 'home' && indexData && (
          <HomePage
            cert={cert}
            storage={storage}
            indexData={indexData}
            passPercent={settings.passPercent}
            questionsByChapter={questionsByChapter}
            onStartFullExam={examHook.startFullExam}
            onStartSection={examHook.startSectionPractice}
          />
        )}
        {activeView === 'exam' && examHook.examState && (
          <ExamPage
            examState={examHook.examState}
            indexData={indexData!}
            passPercent={settings.passPercent}
            onAnswer={examHook.answerQuestion}
            onToggleFlag={examHook.toggleFlag}
            onGoToIndex={examHook.goToIndex}
            onNext={examHook.goNext}
            onPrev={examHook.goPrev}
            onEnterReview={examHook.enterReview}
            onBackToQuestion={examHook.backToQuestion}
            onSubmit={examHook.submitExam}
            onExit={() => { examHook.exitExam(); setView('home'); }}
            onGoHome={() => { examHook.exitExam(); setView('home'); }}
          />
        )}
        {activeView === 'history' && (
          <HistoryPage indexData={indexData} passPercent={settings.passPercent} storage={storage} />
        )}
        {activeView === 'settings' && (
          <SettingsPage settings={settings} onUpdate={updateSettings} />
        )}
      </main>
    </div>
  );
}
