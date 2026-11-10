import { useEffect, useState } from 'react';
import { Dashboard } from './features/dashboard/Dashboard';
import { EnrollmentsPage } from './features/enrollments/EnrollmentsPage';
import { StockPage } from './features/stock/StockPage';
import { api } from './shared/api/client';

const TABS = [
  { hash: '#/', label: 'Painel' },
  { hash: '#/matriculas', label: 'Matrículas' },
  { hash: '#/estoque', label: 'Estoque' },
] as const;

function useHash(): string {
  const [hash, setHash] = useState(window.location.hash || '#/');
  useEffect(() => {
    const onChange = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHash();
  return (
    <div className="shell">
      <header className="topbar">
        <a className="brand" href="#/">GymCRM<span>Gestão de academia</span></a>
        <nav aria-label="Principal">
          {TABS.map((t) => (
            <a key={t.hash} href={t.hash} aria-current={hash === t.hash ? 'page' : undefined}>{t.label}</a>
          ))}
        </nav>
      </header>
      <main>
        {hash === '#/estoque' ? <StockPage /> : hash === '#/matriculas' ? <EnrollmentsPage /> : <Dashboard />}
      </main>
      <footer className="footer">Conectado a <code>{api.baseUrl}</code></footer>
    </div>
  );
}
