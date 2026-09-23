import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';

export default function ConfiguracoesPage() {
  const { user, demoMode } = useAuth();
  return (
    <>
      <PageHeader title="Configurações" subtitle="Dados da igreja, usuários, perfis e segurança." />
      <div className="panel">
        <div className="panel-header"><div className="panel-title"><h3>Ambiente</h3><span>Informações importantes para publicação.</span></div></div>
        <div className="visual-grid">
          <div className="visual-card"><div className="visual-label">Modo</div><div className="visual-value">{demoMode ? 'Demonstração local' : 'Firebase conectado'}</div></div>
          <div className="visual-card"><div className="visual-label">Igreja ID</div><div className="visual-value">{user?.igrejaId}</div></div>
          <div className="visual-card"><div className="visual-label">Perfil</div><div className="visual-value">{user?.perfil}</div></div>
          <div className="visual-card full"><div className="visual-label">Segurança</div><div className="visual-value">Para produção, crie usuários no Firebase Authentication, cadastre o documento em /usuarios e publique as regras do arquivo firestore.rules.</div></div>
        </div>
      </div>
    </>
  );
}
