import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { FileText, Paperclip, Plus, ReceiptText, ShoppingCart } from 'lucide-react';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import FormField from '../components/FormField';
import KpiCard from '../components/KpiCard';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { useChurchData } from '../contexts/ChurchDataContext';
import { salvarAnexoSolicitacao } from '../services/fileStorage';
import { getFinancialWorkflowConfig } from '../services/reportConfig';
import { AnexoSolicitacao, SolicitacaoFinanceira } from '../types';
import { dataBR, moedaBR, normalizarBusca } from '../utils/format';

type FormState = {
  tipo: 'Reembolso' | 'Compra';
  dataSolicitacao: string;
  categoria: string;
  titulo: string;
  descricao: string;
  valor: number;
  notaFiscal?: AnexoSolicitacao;
  orcamentos: AnexoSolicitacao[];
};

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function inicial(): FormState {
  return {
    tipo: 'Reembolso',
    dataSolicitacao: hojeISO(),
    categoria: '',
    titulo: '',
    descricao: '',
    valor: 0,
    notaFiscal: undefined,
    orcamentos: []
  };
}

export default function SolicitacoesFinanceirasPage() {
  const { user } = useAuth();
  const { solicitacoesFinanceiras, createItem, updateItem } = useChurchData();
  const [busca, setBusca] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(inicial());
  const [enviandoArquivo, setEnviandoArquivo] = useState(false);
  const config = getFinancialWorkflowConfig(user?.igrejaId || 'igreja-demo');

  const podeAprovar = user?.perfil === 'pastor' || user?.perfil === 'admin';
  const podeVerTodas = podeAprovar || user?.perfil === 'tesoureiro';

  const rows = useMemo(() => {
    let base = podeVerTodas
      ? solicitacoesFinanceiras
      : solicitacoesFinanceiras.filter((s) => s.solicitanteId === user?.uid);

    const q = normalizarBusca(busca);
    if (q) {
      base = base.filter((s) =>
        [s.titulo, s.categoria, s.descricao, s.solicitanteNome, s.status, s.tipo]
          .some((x) => normalizarBusca(x).includes(q))
      );
    }
    return [...base].sort((a, b) => b.dataSolicitacao.localeCompare(a.dataSolicitacao));
  }, [solicitacoesFinanceiras, busca, podeVerTodas, user?.uid]);

  const pendentes = solicitacoesFinanceiras.filter((s) => s.status === 'Pendente aprovação').length;
  const aprovadas = solicitacoesFinanceiras.filter((s) => s.status === 'Aprovada para financeiro').length;
  const processadas = solicitacoesFinanceiras.filter((s) => s.status === 'Lançada no financeiro').length;
  const reprovadas = solicitacoesFinanceiras.filter((s) => s.status === 'Reprovada').length;

  function nova() {
    setForm(inicial());
    setOpen(true);
  }

  async function anexarNota(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      setEnviandoArquivo(true);
      const anexo = await salvarAnexoSolicitacao(file, user);
      setForm((atual) => ({ ...atual, notaFiscal: anexo }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Falha ao anexar arquivo.');
    } finally {
      setEnviandoArquivo(false);
      e.target.value = '';
    }
  }

  async function anexarOrcamentos(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length || !user) return;
    try {
      setEnviandoArquivo(true);
      const anexos = await Promise.all(files.map((file) => salvarAnexoSolicitacao(file, user)));
      setForm((atual) => ({ ...atual, orcamentos: [...atual.orcamentos, ...anexos] }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Falha ao anexar orçamento.');
    } finally {
      setEnviandoArquivo(false);
      e.target.value = '';
    }
  }

  function removerOrcamento(index: number) {
    setForm((atual) => ({ ...atual, orcamentos: atual.orcamentos.filter((_, i) => i !== index) }));
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!form.titulo.trim() || !form.categoria.trim() || !form.descricao.trim()) return alert('Preencha título, categoria e descrição.');
    if (form.valor <= 0) return alert('Informe um valor maior que zero.');

    if (form.tipo === 'Reembolso' && !form.notaFiscal) {
      return alert('Para solicitar reembolso, a nota fiscal/comprovante é obrigatória.');
    }

    const exigeOrcamentos = form.tipo === 'Compra' && form.valor >= config.valorMinimoOrcamentos;
    if (exigeOrcamentos && form.orcamentos.length < config.quantidadeOrcamentos) {
      return alert(`Para compras a partir de ${moedaBR(config.valorMinimoOrcamentos)}, anexe pelo menos ${config.quantidadeOrcamentos} orçamento(s).`);
    }

    const payload: Omit<SolicitacaoFinanceira, 'id'> = {
      igrejaId: user.igrejaId,
      tipo: form.tipo,
      dataSolicitacao: form.dataSolicitacao,
      categoria: form.categoria.trim(),
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim(),
      valor: form.valor,
      solicitanteId: user.uid,
      solicitanteNome: user.nome,
      status: 'Pendente aprovação',
      notaFiscal: form.tipo === 'Reembolso' ? form.notaFiscal : undefined,
      orcamentos: form.tipo === 'Compra' ? form.orcamentos : [],
      observacaoAprovacao: '',
      ativo: true
    };

    await createItem('solicitacoesFinanceiras', payload);
    setOpen(false);
  }

  async function decidir(row: SolicitacaoFinanceira, aprovar: boolean) {
    if (!user || !podeAprovar) return;
    const observacao = window.prompt(aprovar ? 'Observação da aprovação (opcional):' : 'Motivo da reprovação:') || '';
    if (!aprovar && !observacao.trim()) return alert('Informe o motivo da reprovação.');

    await updateItem('solicitacoesFinanceiras', row.id, {
      status: aprovar ? 'Aprovada para financeiro' : 'Reprovada',
      observacaoAprovacao: observacao.trim(),
      aprovadoPorId: user.uid,
      aprovadoPorNome: user.nome,
      aprovadoEm: new Date().toISOString()
    });
  }

  function statusColor(status: SolicitacaoFinanceira['status']) {
    if (status === 'Pendente aprovação') return 'orange';
    if (status === 'Aprovada para financeiro') return 'blue';
    if (status === 'Lançada no financeiro') return 'green';
    return 'red';
  }

  return (
    <>
      <PageHeader
        title="Solicitações financeiras"
        subtitle="Fluxo interno de reembolso e autorização de compras antes de qualquer lançamento no financeiro."
        actions={<button className="btn btn-primary" onClick={nova}><Plus size={16} /> Nova solicitação</button>}
      />

      <div className="stats-grid request-stats">
        <KpiCard label="Aguardando Pastor" value={pendentes} />
        <KpiCard label="Aprovadas p/ Financeiro" value={aprovadas} />
        <KpiCard label="Lançadas" value={processadas} />
        <KpiCard label="Reprovadas" value={reprovadas} />
      </div>

      <div className="workflow-strip">
        <div><span>1</span><strong>Solicitação</strong><small>Reembolso ou compra</small></div>
        <b>→</b>
        <div><span>2</span><strong>Aprovação pastoral</strong><small>Pastor/Admin decide</small></div>
        <b>→</b>
        <div><span>3</span><strong>Financeiro</strong><small>Somente aprovadas</small></div>
        <b>→</b>
        <div><span>4</span><strong>Lançamento</strong><small>Despesa registrada</small></div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title"><h3>Pipeline de solicitações</h3><span>{rows.length} registro(s) visível(is) para seu perfil</span></div>
          <input className="search-input" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar solicitação" />
        </div>

        <DataTable<SolicitacaoFinanceira>
          rows={rows}
          minWidth={1250}
          columns={[
            { header: 'Data', render: (r) => dataBR(r.dataSolicitacao) },
            { header: 'Tipo', render: (r) => <Badge color={r.tipo === 'Reembolso' ? 'purple' : 'teal'}>{r.tipo}</Badge> },
            { header: 'Solicitante', render: (r) => r.solicitanteNome },
            { header: 'Título', render: (r) => <strong>{r.titulo}</strong> },
            { header: 'Categoria', render: (r) => r.categoria },
            { header: 'Valor', render: (r) => <strong>{moedaBR(r.valor)}</strong> },
            { header: 'Anexos', render: (r) => <div className="attachment-links">
              {r.notaFiscal && <a href={r.notaFiscal.url} target="_blank" rel="noreferrer"><ReceiptText size={14} /> Nota fiscal</a>}
              {r.orcamentos.map((a, i) => <a key={i} href={a.url} target="_blank" rel="noreferrer"><FileText size={14} /> Orç. {i + 1}</a>)}
              {!r.notaFiscal && !r.orcamentos.length && '-'}
            </div> },
            { header: 'Status', render: (r) => <Badge color={statusColor(r.status)}>{r.status}</Badge> },
            { header: 'Aprovação', render: (r) => r.aprovadoPorNome ? <span>{r.aprovadoPorNome}{r.observacaoAprovacao ? ` • ${r.observacaoAprovacao}` : ''}</span> : '-' },
            { header: 'Ações', render: (r) => <div className="actions">
              {podeAprovar && r.status === 'Pendente aprovação' && <>
                <button className="btn btn-success compact-btn" onClick={() => decidir(r, true)}>Aprovar</button>
                <button className="btn btn-danger compact-btn" onClick={() => decidir(r, false)}>Reprovar</button>
              </>}
              {r.status !== 'Pendente aprovação' && <span className="muted-small">Sem ação pastoral</span>}
            </div> }
          ]}
        />
      </div>

      <Modal title="Nova solicitação financeira" subtitle="O pedido só chega ao Financeiro depois da aprovação pastoral." open={open} onClose={() => setOpen(false)}>
        <form onSubmit={salvar}>
          <div className="request-type-grid">
            <button type="button" className={`request-type-card ${form.tipo === 'Reembolso' ? 'selected' : ''}`} onClick={() => setForm({ ...form, tipo: 'Reembolso', orcamentos: [] })}>
              <ReceiptText size={24} /><strong>Reembolso</strong><span>Despesa já realizada. Exige nota fiscal/comprovante.</span>
            </button>
            <button type="button" className={`request-type-card ${form.tipo === 'Compra' ? 'selected' : ''}`} onClick={() => setForm({ ...form, tipo: 'Compra', notaFiscal: undefined })}>
              <ShoppingCart size={24} /><strong>Autorização de compra</strong><span>Gasto futuro. Pode exigir múltiplos orçamentos.</span>
            </button>
          </div>

          <div className="form-grid">
            <FormField label="Data da solicitação"><input type="date" value={form.dataSolicitacao} onChange={(e) => setForm({ ...form, dataSolicitacao: e.target.value })} /></FormField>
            <FormField label="Categoria"><input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} placeholder="Mídia, Célula, Evento, Manutenção..." /></FormField>
            <FormField label="Valor"><input type="number" step="0.01" min="0" value={form.valor} onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })} /></FormField>
            <FormField label="Título" full><input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Resumo da solicitação" /></FormField>
            <FormField label="Descrição / justificativa" full><textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></FormField>
          </div>

          {form.tipo === 'Reembolso' ? (
            <div className="upload-panel">
              <div><strong>Nota fiscal / comprovante</strong><p>Obrigatória para enviar o reembolso para aprovação.</p></div>
              <label className="btn btn-soft file-button"><Paperclip size={16} /> {enviandoArquivo ? 'Enviando...' : 'Anexar nota'}
                <input type="file" accept=".pdf,image/jpeg,image/png,image/webp" onChange={anexarNota} disabled={enviandoArquivo} hidden />
              </label>
              {form.notaFiscal && <div className="uploaded-file"><a href={form.notaFiscal.url} target="_blank" rel="noreferrer">{form.notaFiscal.nome}</a><button type="button" onClick={() => setForm({ ...form, notaFiscal: undefined })}>Remover</button></div>}
            </div>
          ) : (
            <div className="upload-panel">
              <div>
                <strong>Orçamentos</strong>
                <p>
                  {form.valor >= config.valorMinimoOrcamentos
                    ? `Obrigatório: ${config.quantidadeOrcamentos} orçamento(s), pois o valor é igual ou superior a ${moedaBR(config.valorMinimoOrcamentos)}.`
                    : `Para valores abaixo de ${moedaBR(config.valorMinimoOrcamentos)}, os orçamentos são opcionais.`}
                </p>
              </div>
              <label className="btn btn-soft file-button"><Paperclip size={16} /> {enviandoArquivo ? 'Enviando...' : 'Anexar orçamento(s)'}
                <input type="file" multiple accept=".pdf,image/jpeg,image/png,image/webp" onChange={anexarOrcamentos} disabled={enviandoArquivo} hidden />
              </label>
              <div className="uploaded-list">
                {form.orcamentos.map((a, i) => <div className="uploaded-file" key={i}><a href={a.url} target="_blank" rel="noreferrer">{a.nome}</a><button type="button" onClick={() => removerOrcamento(i)}>Remover</button></div>)}
              </div>
            </div>
          )}

          <div className="modal-actions-right">
            <button className="btn btn-soft" type="button" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="btn btn-success" type="submit" disabled={enviandoArquivo}>Enviar para aprovação</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
