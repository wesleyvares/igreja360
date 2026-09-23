import { ChangeEvent, FormEvent, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import {
  ChurchCommunicationConfig,
  getChurchCommunicationConfig,
  saveChurchCommunicationConfig
} from '../services/churchCommunicationConfig';
import {
  FinancialWorkflowConfig,
  getFinancialWorkflowConfig,
  getReportBrandConfig,
  ReportBrandConfig,
  saveFinancialWorkflowConfig,
  saveReportBrandConfig
} from '../services/reportConfig';
import { moedaBR } from '../utils/format';

const perfis = [
  { nome: 'Pastor', acesso: 'Acesso geral e aprovação das solicitações financeiras antes de chegarem à tesouraria.' },
  { nome: 'Administrador', acesso: 'Acesso geral operacional, configurações, relatórios e aprovação administrativa.' },
  { nome: 'Secretaria', acesso: 'Membros, visitantes, células, eventos, relatórios, avisos e abertura de solicitações financeiras.' },
  { nome: 'Tesoureiro', acesso: 'Financeiro, relatórios financeiros e processamento das solicitações já aprovadas.' },
  { nome: 'Líder', acesso: 'Sua célula, relatório da célula, visitantes, quadro de avisos e abertura de solicitações.' },
  { nome: 'Mídia', acesso: 'Eventos, avisos, rádio e abertura de solicitações financeiras.' },
  { nome: 'Membro', acesso: 'Quadro de avisos e rádio.' },
  { nome: 'Visitante', acesso: 'Conteúdo permitido e rádio, sem acesso administrativo.' }
];

function lerImagem(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.readAsDataURL(file);
  });
}

export default function ConfiguracoesPage() {
  const { user, demoMode } = useAuth();
  const igrejaId = user?.igrejaId || 'igreja-demo';
  const [comunicacao, setComunicacao] = useState<ChurchCommunicationConfig>(() => getChurchCommunicationConfig());
  const [relatorios, setRelatorios] = useState<ReportBrandConfig>(() => getReportBrandConfig(igrejaId));
  const [financeiroCfg, setFinanceiroCfg] = useState<FinancialWorkflowConfig>(() => getFinancialWorkflowConfig(igrejaId));
  const [salvo, setSalvo] = useState('');

  function feedback(texto: string) {
    setSalvo(texto);
    window.setTimeout(() => setSalvo(''), 2200);
  }

  function salvarComunicacao(e: FormEvent) {
    e.preventDefault();
    saveChurchCommunicationConfig(comunicacao);
    feedback('Comunicação salva ✓');
  }

  function salvarRelatorios(e: FormEvent) {
    e.preventDefault();
    saveReportBrandConfig(igrejaId, relatorios);
    feedback('Identidade dos relatórios salva ✓');
  }

  function salvarFluxoFinanceiro(e: FormEvent) {
    e.preventDefault();
    if (financeiroCfg.valorMinimoOrcamentos < 0) return alert('O valor mínimo não pode ser negativo.');
    if (financeiroCfg.quantidadeOrcamentos < 1) return alert('A quantidade mínima de orçamentos deve ser ao menos 1.');
    saveFinancialWorkflowConfig(igrejaId, financeiroCfg);
    feedback('Regras financeiras salvas ✓');
  }

  async function carregarLogo(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Selecione uma imagem.');
    if (file.size > 800 * 1024) return alert('No piloto, use uma logo com até 800 KB.');
    try {
      const logoDataUrl = await lerImagem(file);
      setRelatorios((atual) => ({ ...atual, logoDataUrl }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Falha ao carregar a logo.');
    } finally {
      e.target.value = '';
    }
  }

  return (
    <>
      <PageHeader title="Configurações" subtitle="Identidade da igreja, perfis, comunicação, relatórios e regras financeiras." />

      {salvo && <div className="save-banner">{salvo}</div>}

      <div className="panel">
        <div className="panel-header"><div className="panel-title"><h3>Ambiente</h3><span>Informações importantes para publicação.</span></div></div>
        <div className="visual-grid">
          <div className="visual-card"><div className="visual-label">Modo</div><div className="visual-value">{demoMode ? 'Demonstração local' : 'Firebase conectado'}</div></div>
          <div className="visual-card"><div className="visual-label">Igreja ID</div><div className="visual-value">{user?.igrejaId}</div></div>
          <div className="visual-card"><div className="visual-label">Perfil</div><div className="visual-value">{user?.perfil}</div></div>
          <div className="visual-card full"><div className="visual-label">Multi-igreja</div><div className="visual-value">O produto continua se chamando Igreja 360, mas os relatórios emitidos usam a identidade configurada de cada igreja.</div></div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title"><h3>Identidade dos relatórios</h3><span>Nome, logo, cor e texto de cabeçalho aplicados aos relatórios emitidos.</span></div>
        </div>
        <div className="modal-body">
          <form onSubmit={salvarRelatorios}>
            <div className="report-brand-layout">
              <div className="form-grid">
                <label>Nome da igreja
                  <input value={relatorios.nomeIgreja} onChange={(e) => setRelatorios({ ...relatorios, nomeIgreja: e.target.value })} />
                </label>
                <label>Cor principal
                  <div className="color-field"><input type="color" value={relatorios.corPrimaria} onChange={(e) => setRelatorios({ ...relatorios, corPrimaria: e.target.value })} /><input value={relatorios.corPrimaria} onChange={(e) => setRelatorios({ ...relatorios, corPrimaria: e.target.value })} /></div>
                </label>
                <label className="full">Texto do cabeçalho
                  <textarea value={relatorios.cabecalhoRelatorios} onChange={(e) => setRelatorios({ ...relatorios, cabecalhoRelatorios: e.target.value })} placeholder={"Nome da igreja\nEndereço\nContato ou informação institucional"} />
                </label>
                <label className="full">Logo da igreja
                  <input type="file" accept="image/*" onChange={carregarLogo} />
                </label>
              </div>

              <div className="report-brand-preview" style={{ borderTopColor: relatorios.corPrimaria }}>
                {relatorios.logoDataUrl ? <img src={relatorios.logoDataUrl} alt="Prévia da logo" /> : <div className="logo-placeholder">LOGO</div>}
                <div><strong style={{ color: relatorios.corPrimaria }}>{relatorios.nomeIgreja || 'Nome da igreja'}</strong><p>{relatorios.cabecalhoRelatorios || 'Texto do cabeçalho'}</p></div>
              </div>
            </div>
            <div className="modal-actions-right">
              {relatorios.logoDataUrl && <button className="btn btn-ghost" type="button" onClick={() => setRelatorios({ ...relatorios, logoDataUrl: '' })}>Remover logo</button>}
              <button className="btn btn-success" type="submit">Salvar identidade</button>
            </div>
          </form>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title"><h3>Regras de solicitações financeiras</h3><span>Define quando uma compra precisa de múltiplos orçamentos antes da aprovação.</span></div>
        </div>
        <div className="modal-body">
          <form onSubmit={salvarFluxoFinanceiro}>
            <div className="form-grid">
              <label>Valor a partir do qual exige orçamentos
                <input type="number" min="0" step="0.01" value={financeiroCfg.valorMinimoOrcamentos} onChange={(e) => setFinanceiroCfg({ ...financeiroCfg, valorMinimoOrcamentos: Number(e.target.value) })} />
              </label>
              <label>Quantidade mínima de orçamentos
                <input type="number" min="1" max="10" value={financeiroCfg.quantidadeOrcamentos} onChange={(e) => setFinanceiroCfg({ ...financeiroCfg, quantidadeOrcamentos: Number(e.target.value) })} />
              </label>
            </div>
            <div className="finance-rule-example">
              Exemplo: compras a partir de <strong>{moedaBR(financeiroCfg.valorMinimoOrcamentos)}</strong> exigirão <strong>{financeiroCfg.quantidadeOrcamentos}</strong> orçamento(s) anexado(s).
            </div>
            <div className="modal-actions-right"><button className="btn btn-success" type="submit">Salvar regras financeiras</button></div>
          </form>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header"><div className="panel-title"><h3>Perfis e acessos</h3><span>Matriz atual de permissões.</span></div></div>
        <div className="role-grid">
          {perfis.map((perfil) => <div className="role-card" key={perfil.nome}><strong>{perfil.nome}</strong><p>{perfil.acesso}</p></div>)}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title"><h3>Comunicação com visitantes</h3><span>Informações usadas nas mensagens prontas do WhatsApp.</span></div>
        </div>
        <div className="modal-body">
          <form onSubmit={salvarComunicacao}>
            <div className="form-grid">
              <label>Nome da igreja
                <input value={comunicacao.nomeIgreja} onChange={(e) => setComunicacao({ ...comunicacao, nomeIgreja: e.target.value })} />
              </label>
              <label>Instagram
                <input value={comunicacao.instagramUrl} onChange={(e) => setComunicacao({ ...comunicacao, instagramUrl: e.target.value })} />
              </label>
              <label>Assinatura
                <input value={comunicacao.assinatura} onChange={(e) => setComunicacao({ ...comunicacao, assinatura: e.target.value })} />
              </label>
              <label className="full">Horários de culto
                <textarea value={comunicacao.cultos} onChange={(e) => setComunicacao({ ...comunicacao, cultos: e.target.value })} />
              </label>
              <label className="full">Endereço / localização
                <input value={comunicacao.endereco} onChange={(e) => setComunicacao({ ...comunicacao, endereco: e.target.value })} />
              </label>
            </div>
            <div className="modal-actions-right"><button className="btn btn-success" type="submit">Salvar comunicação</button></div>
          </form>
        </div>
      </div>
    </>
  );
}
