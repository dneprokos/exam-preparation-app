import { CERTIFICATIONS } from '../certifications/registry';
import { certStorage } from '../utils/storage';

interface Props {
  onSelect: (certId: string) => void;
}

export function CertificationSelectPage({ onSelect }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Choose a certification</h1>
          <p className="text-gray-500 dark:text-gray-400">Pick an exam to practise for.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {CERTIFICATIONS.map(cert => {
            const resumable =
              cert.status === 'available' && certStorage(cert.storagePrefix).getInProgress() !== null;
            return (
              <button
                key={cert.id}
                type="button"
                onClick={() => onSelect(cert.id)}
                className="p-6 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl text-left transition space-y-2"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                  {cert.provider}
                </div>
                <div className="text-xl font-bold">{cert.title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{cert.description}</div>
                {cert.status === 'wip' && (
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold">
                    Work in progress
                  </span>
                )}
                {resumable && (
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold">
                    Exam in progress — resume
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
