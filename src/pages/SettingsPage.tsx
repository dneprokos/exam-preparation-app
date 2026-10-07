import type { AppSettings } from '../types';

interface Props {
  settings: AppSettings;
  onUpdate: (patch: Partial<AppSettings>) => void;
}

export function SettingsPage({ settings, onUpdate }: Props) {
  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">Pass threshold</div>
            <div className="text-xs text-gray-500">{settings.passPercent}% (default is 65%)</div>
          </div>
          <input
            type="range"
            min={50}
            max={90}
            step={5}
            value={settings.passPercent}
            onChange={e => onUpdate({ passPercent: Number(e.target.value) })}
            className="w-28"
          />
        </div>

        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">Randomize question order</div>
            <div className="text-xs text-gray-500">Shuffle questions each exam</div>
          </div>
          <button
            onClick={() => onUpdate({ randomizeQuestions: !settings.randomizeQuestions })}
            className={`w-10 h-6 rounded-full transition ${settings.randomizeQuestions ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span className={`block w-4 h-4 rounded-full bg-white shadow mx-1 transition-transform ${settings.randomizeQuestions ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">Randomize option order</div>
            <div className="text-xs text-gray-500">Shuffle answer options</div>
          </div>
          <button
            onClick={() => onUpdate({ randomizeOptions: !settings.randomizeOptions })}
            className={`w-10 h-6 rounded-full transition ${settings.randomizeOptions ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span className={`block w-4 h-4 rounded-full bg-white shadow mx-1 transition-transform ${settings.randomizeOptions ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">Dark mode</div>
            <div className="text-xs text-gray-500">Switch between light and dark theme</div>
          </div>
          <button
            onClick={() => onUpdate({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            className={`w-10 h-6 rounded-full transition ${settings.theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span className={`block w-4 h-4 rounded-full bg-white shadow mx-1 transition-transform ${settings.theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
