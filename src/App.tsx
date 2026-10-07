import { useEffect } from 'react';
import { useSettings } from './hooks/useSettings';
import { useHashRoute } from './hooks/useHashRoute';
import { getCertification } from './certifications/registry';
import { CertificationSelectPage } from './pages/CertificationSelectPage';
import { WorkInProgressPage } from './pages/WorkInProgressPage';
import { CertificationApp } from './pages/CertificationApp';

export default function App() {
  const { settings, updateSettings } = useSettings();
  const { certId, navigate } = useHashRoute();

  // Apply dark mode class to <html> (shell level so it covers every page)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  const cert = certId ? getCertification(certId) : undefined;

  if (!cert) {
    return <CertificationSelectPage onSelect={navigate} />;
  }

  if (cert.status === 'wip') {
    return <WorkInProgressPage cert={cert} onBack={() => navigate(null)} />;
  }

  return (
    <CertificationApp
      key={cert.id}
      cert={cert}
      settings={settings}
      updateSettings={updateSettings}
      onBackToCertifications={() => navigate(null)}
    />
  );
}
