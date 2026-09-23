import { FormEvent, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import {
  ChurchCommunicationConfig,
  getChurchCommunicationConfig,
  saveChurchCommunicationConfig
} from '../services/churchCommunicationConfig';

export default function ConfiguracoesPage() {
  const { user, demoMode } = useAuth();
  const [comunicacao, setComunicacao] = useState<ChurchCommunicationConfig>(() => getChurchCommunicationConfig());
  const [salvo, setSalvo] = useState(false);

  function salvarComunicacao(e: FormEvent) {
    e.preventDefault();
    saveChurchCommunicationConfig(comunicacao);
    setSalvo(true);
    window.setTimeout(() => setSalvo(false), 2200);
  }

  return (
    <>
      <PageHeader title="Configurações" subtitle="Dados da igreja, usuários, perfis, comunicação e segurança." />

      <div className="panel">
        <div className="panel-header"><div className="panel-title"><h3>Ambiente</h3><span>Informações importantes para publicação.</span></div></div>
        <div className="visual-grid">
          <div className="visual-card"><div className="visual-label">Modo</div><div className="visual-value">{demoMode ? 'Demonstração local' : 'Firebase conectado'}</div></div>
          <div className="visual-card"><div className="visual-label">Igreja ID</div><div className="visual-value">{user?.igrejaId}</div></div>
          <div className="visual-card"><div className="visual-label">Perfil</div><div className="visual-value">{user?.perfil}</div></div>
          <div className="visual-card full"><div className="visual-label">Segurança</div><div className="visual-value">Para produção, crie usuários no Firebase Authentication, cadastre o documento em /usuarios e publique as regras do arquivo firestore.rules.</div></div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <h3>Comunicação com visitantes</h3>
            <span>Estas informações entram automaticamente nas mensagens prontas do WhatsApp.</span>
          </div>
        </div>
        <div className="modal-body">
          <form onSubmit={salvarComunicacao}>
            <div className="form-grid">
              <label>Nome da igreja
                <input value={comunicacao.nomeIgreja} onChange={(e) => setComunicacao({ ...comunicacao, nomeIgreja: e.target.value })} />
              </label>
              <label>Instagram
                <input value={comunicacao.instagramUrl} onChange={(e) => setComunicacao({ ...comunicacao, instagramUrl: e.target.value })} placeholder="https://instagram.com/suaigreja" />
              </label>
              <label>Assinatura
                <input value={comunicacao.assinatura} onChange={(e) => setComunicacao({ ...comunicacao, assinatura: e.target.value })} placeholder="Equipe Casa do Céu" />
              </label>
              <label className="full">Horários de culto
                <textarea value={comunicacao.cultos} onChange={(e) => setComunicacao({ ...comunicacao, cultos: e.target.value })} placeholder={"Domingo às 19h\nQuinta às 19h30"} />
              </label>
              <label className="full">Endereço / localização
                <input value={comunicacao.endereco} onChange={(e) => setComunicacao({ ...comunicacao, endereco: e.target.value })} placeholder="Endereço da igreja ou link do Google Maps" />
              </label>
            </div>
            <div className="modal-actions-right">
              {salvo && <span className="save-feedback">Configurações salvas ✓</span>}
              <button className="btn btn-success" type="submit">Salvar comunicação</button>
            </div>
          </form>
          <p className="config-note">No piloto, estas informações ficam neste navegador. Quando conectarmos o Firestore, elas serão centralizadas para toda a equipe da igreja.</p>
        </div>
      </div>
    </>
  );
}
