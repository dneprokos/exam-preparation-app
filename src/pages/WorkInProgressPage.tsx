import type { Certification } from '../certifications/registry';

interface Props {
  cert: Certification;
  onBack: () => void;
}

export function WorkInProgressPage({ cert, onBack }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <div className="text-5xl">🚧</div>
        <h1 className="text-2xl font-bold">{cert.title}</h1>
        <p className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold">
          Work in progress
        </p>
        <p className="text-gray-500 dark:text-gray-400">
          Practice questions for this certification are not available yet. Check back later.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
        >
          Back to all certifications
        </button>
      </div>
    </div>
  );
}
