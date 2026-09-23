import { FormEvent, useMemo, useState } from 'react';
import { CheckCheck, Plus, Printer, Users } from 'lucide-react';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import FormField from '../components/FormField';
import KpiCard from '../components/KpiCard';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { useChurchData } from '../contexts/ChurchDataContext';
import { emitirRelatorioCelula } from '../services/printReport';
import { getReportBrandConfig } from '../services/reportConfig';
import { RelatorioCelula, RelatorioCelulaPresenca, RelatorioCelulaVisitante } from '../types';
import { dataBR } from '../utils/format';

type FormState = {
  celulaId: string;
  dataReuniao: string;
  presencas: RelatorioCelulaPresenca[];
  visitantes: RelatorioCelulaVisitante[];
  quemTocouLouvor: string;
  quemConduziuLouvores: string;
  louvoresMinistrados: string;
  quemMinistrouQuebraGelo: string;
  quemMinistrouPalavra: string;
  quemMinistrouCadeiraVazia: string;
  houvePedidoOracao: boolean;
  pedidoOracaoDescricao: string;
  houveTestemunho: boolean;
  testemunhoDescricao: string;
  nivelParticipacao: 1 | 2 | 3 | 4 | 5;
};

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function formInicial(celulaId = '', presencas: RelatorioCelulaPresenca[] = []): FormState {
  return {
    celulaId,
    dataReuniao: hojeISO(),
    presencas,
    visitantes: [],
    quemTocouLouvor: '',
    quemConduziuLouvores: '',
    louvoresMinistrados: '',
    quemMinistrouQuebraGelo: '',
    quemMinistrouPalavra: '',
    quemMinistrouCadeiraVazia: '',
    houvePedidoOracao: false,
    pedidoOracaoDescricao: '',
    houveTestemunho: false,
    testemunhoDescricao: '',
    nivelParticipacao: 3
  };
}

export default function RelatoriosCelulaPage() {
  const { user } = useAuth();
  const { celulas, membros, relatoriosCelula, createItem, updateItem, removeItem } = useChurchData();
  const [filtroCelula, setFiltroCelula] = useState(user?.perfil === 'lider' ? user.celulaId || '' : '');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RelatorioCelula | null>(null);
  const [form, setForm] = useState<FormState>(formInicial());

  const celulasPermitidas = useMemo(() => {
    if (user?.perfil === 'lider') return celulas.filter((c) => c.id === user.celulaId);
    return celulas;
  }, [celulas, user?.perfil, user?.celulaId]);

  const relatoriosFiltrados = useMemo(() => {
    const base = filtroCelula ? relatoriosCelula.filter((r) => r.celulaId === filtroCelula) : relatoriosCelula;
    return [...base].sort((a, b) => b.dataReuniao.localeCompare(a.dataReuniao));
  }, [relatoriosCelula, filtroCelula]);

  const totalReunioes = relatoriosFiltrados.length;
  const totalVisitantes = relatoriosFiltrados.reduce((sum, r) => sum + r.visitantes.length, 0);
  const totalPossiveis = relatoriosFiltrados.reduce((sum, r) => sum + r.presencas.length, 0);
  const totalPresentes = relatoriosFiltrados.reduce((sum, r) => sum + r.presencas.filter((p) => p.presente).length, 0);
  const frequenciaMedia = totalPossiveis ? Math.round((totalPresentes / totalPossiveis) * 100) : 0;
  const ultimaReuniao = relatoriosFiltrados[0]?.dataReuniao || '';

  function montarPresencas(celulaId: string) {
    return membros
      .filter((m) => m.celulaId === celulaId && m.status !== 'Inativo')
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .map((m) => ({ membroId: m.id, nome: m.nome, presente: false }));
  }

  function novaReuniao() {
    const celulaId = user?.perfil === 'lider'
      ? user.celulaId || ''
      : filtroCelula || celulasPermitidas[0]?.id || '';

    setEditing(null);
    setForm(formInicial(celulaId, montarPresencas(celulaId)));
    setOpen(true);
  }

  function editarRelatorio(relatorio: RelatorioCelula) {
    setEditing(relatorio);
    setForm({
      celulaId: relatorio.celulaId,
      dataReuniao: relatorio.dataReuniao,
      presencas: relatorio.presencas || [],
      visitantes: relatorio.visitantes || [],
      quemTocouLouvor: relatorio.quemTocouLouvor || '',
      quemConduziuLouvores: relatorio.quemConduziuLouvores || '',
      louvoresMinistrados: relatorio.louvoresMinistrados || '',
      quemMinistrouQuebraGelo: relatorio.quemMinistrouQuebraGelo || '',
      quemMinistrouPalavra: relatorio.quemMinistrouPalavra || '',
      quemMinistrouCadeiraVazia: relatorio.quemMinistrouCadeiraVazia || '',
      houvePedidoOracao: Boolean(relatorio.houvePedidoOracao),
      pedidoOracaoDescricao: relatorio.pedidoOracaoDescricao || '',
      houveTestemunho: Boolean(relatorio.houveTestemunho),
      testemunhoDescricao: relatorio.testemunhoDescricao || '',
      nivelParticipacao: relatorio.nivelParticipacao || 3
    });
    setOpen(true);
  }

  function mudarCelula(celulaId: string) {
    setForm((atual) => ({
      ...atual,
      celulaId,
      presencas: montarPresencas(celulaId)
    }));
  }

  function marcarPresenca(membroId: string, presente: boolean) {
    setForm((atual) => ({
      ...atual,
      presencas: atual.presencas.map((p) => p.membroId === membroId ? { ...p, presente } : p)
    }));
  }

  function marcarTodos(presente: boolean) {
    setForm((atual) => ({
      ...atual,
      presencas: atual.presencas.map((p) => ({ ...p, presente }))
    }));
  }

  function adicionarVisitante() {
    setForm((atual) => ({
      ...atual,
      visitantes: [...atual.visitantes, { nome: '', telefone: '' }]
    }));
  }

  function atualizarVisitante(index: number, campo: keyof RelatorioCelulaVisitante, valor: string) {
    setForm((atual) => ({
      ...atual,
      visitantes: atual.visitantes.map((v, i) => i === index ? { ...v, [campo]: valor } : v)
    }));
  }

  function removerVisitante(index: number) {
    setForm((atual) => ({
      ...atual,
      visitantes: atual.visitantes.filter((_, i) => i !== index)
    }));
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!form.celulaId) return alert('Selecione a célula.');
    if (!form.dataReuniao) return alert('Informe a data da reunião.');
    if (!form.quemTocouLouvor.trim()) return alert('Informe quem tocou no louvor.');
    if (!form.quemConduziuLouvores.trim()) return alert('Informe quem conduziu os louvores.');
    if (!form.louvoresMinistrados.trim()) return alert('Informe quais louvores foram ministrados.');
    if (!form.quemMinistrouQuebraGelo.trim()) return alert('Informe quem ministrou o quebra-gelo.');
    if (!form.quemMinistrouPalavra.trim()) return alert('Informe quem ministrou a Palavra.');
    if (!form.quemMinistrouCadeiraVazia.trim()) return alert('Informe quem ministrou a Cadeira Vazia.');
    if (form.houvePedidoOracao && !form.pedidoOracaoDescricao.trim()) return alert('Descreva brevemente o pedido de oração e quem pediu.');
    if (form.houveTestemunho && !form.testemunhoDescricao.trim()) return alert('Descreva brevemente o testemunho e quem compartilhou.');

    const celula = celulas.find((c) => c.id === form.celulaId);
    if (!celula) return alert('Célula não encontrada.');

    const visitantesValidos = form.visitantes.filter((v) => v.nome.trim());

    const payload: Omit<RelatorioCelula, 'id'> = {
      igrejaId: user.igrejaId,
      celulaId: celula.id,
      celulaNome: celula.nome,
      liderId: user.uid,
      liderNome: user.perfil === 'lider' ? user.nome : celula.lider || user.nome,
      dataReuniao: form.dataReuniao,
      presencas: form.presencas,
      visitantes: visitantesValidos,

      quemTocouLouvor: form.quemTocouLouvor.trim(),
      quemConduziuLouvores: form.quemConduziuLouvores.trim(),
      louvoresMinistrados: form.louvoresMinistrados.trim(),
      quemMinistrouQuebraGelo: form.quemMinistrouQuebraGelo.trim(),
      quemMinistrouPalavra: form.quemMinistrouPalavra.trim(),
      quemMinistrouCadeiraVazia: form.quemMinistrouCadeiraVazia.trim(),

      houvePedidoOracao: form.houvePedidoOracao,
      pedidoOracaoDescricao: form.houvePedidoOracao ? form.pedidoOracaoDescricao.trim() : '',
      houveTestemunho: form.houveTestemunho,
      testemunhoDescricao: form.houveTestemunho ? form.testemunhoDescricao.trim() : '',

      preenchidoPorId: editing?.preenchidoPorId || user.uid,
      preenchidoPorNome: editing?.preenchidoPorNome || user.nome,
      nivelParticipacao: form.nivelParticipacao,
      ativo: true
    };

    if (editing) await updateItem('relatoriosCelula', editing.id, payload);
    else await createItem('relatoriosCelula', payload);

    setOpen(false);
    setFiltroCelula(celula.id);
  }

  const podeExcluir = user?.perfil === 'pastor' || user?.perfil === 'admin';

  return (
    <>
      <PageHeader
        title="Relatório da Célula"
        subtitle="Registre a reunião completa: equipe, louvores, Palavra, participação, presença, visitantes, oração e testemunhos."
        actions={<button className="btn btn-primary" onClick={novaReuniao}><Plus size={16} /> Registrar reunião</button>}
      />

      {user?.perfil === 'lider' && !user.celulaId && (
        <div className="info-box cell-report-warning">
          Seu usuário de líder ainda não está vinculado a uma célula. O administrador precisa preencher o campo celulaId no cadastro do usuário.
        </div>
      )}

      <div className="cell-report-toolbar">
        <label>Célula
          <select value={filtroCelula} onChange={(e) => setFiltroCelula(e.target.value)} disabled={user?.perfil === 'lider'}>
            {user?.perfil !== 'lider' && <option value="">Todas as células</option>}
            {celulasPermitidas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </label>
      </div>

      <div className="stats-grid cell-report-stats">
        <KpiCard label="Reuniões registradas" value={totalReunioes} />
        <KpiCard label="Frequência média" value={`${frequenciaMedia}%`} />
        <KpiCard label="Visitantes nas reuniões" value={totalVisitantes} />
        <KpiCard label="Última reunião" value={ultimaReuniao ? dataBR(ultimaReuniao) : '-'} />
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title"><h3>Histórico de reuniões</h3><span>{relatoriosFiltrados.length} relatório(s) encontrado(s)</span></div>
        </div>
        <DataTable<RelatorioCelula>
          rows={relatoriosFiltrados}
          minWidth={1180}
          columns={[
            { header: 'Data', render: (r) => <strong>{dataBR(r.dataReuniao)}</strong> },
            { header: 'Célula', render: (r) => r.celulaNome },
            { header: 'Líder', render: (r) => r.liderNome },
            { header: 'Presentes', render: (r) => <Badge color="green">{r.presencas.filter((p) => p.presente).length}</Badge> },
            { header: 'Ausentes', render: (r) => <Badge color="orange">{r.presencas.filter((p) => !p.presente).length}</Badge> },
            { header: 'Visitantes', render: (r) => <Badge color="blue">{r.visitantes.length}</Badge> },
            { header: 'Participação', render: (r) => <Badge color={r.nivelParticipacao >= 4 ? 'green' : r.nivelParticipacao <= 2 ? 'orange' : 'blue'}>{r.nivelParticipacao || '-'} / 5</Badge> },
            { header: 'Oração', render: (r) => r.houvePedidoOracao ? <Badge color="purple">Sim</Badge> : <Badge color="gray">Não</Badge> },
            { header: 'Testemunho', render: (r) => r.houveTestemunho ? <Badge color="teal">Sim</Badge> : <Badge color="gray">Não</Badge> },
            { header: 'Preenchido por', render: (r) => r.preenchidoPorNome || '-' },
            { header: 'Frequência', render: (r) => {
              const total = r.presencas.length;
              const presentes = r.presencas.filter((p) => p.presente).length;
              return total ? `${Math.round((presentes / total) * 100)}%` : '-';
            }},
            { header: 'Ações', render: (r) => <div className="actions">
              <button className="icon-btn" title="Emitir relatório / PDF" onClick={() => emitirRelatorioCelula(r, getReportBrandConfig(user?.igrejaId || 'igreja-demo'))}><Printer size={16} /></button>
              <button className="icon-btn" title="Editar relatório" onClick={() => editarRelatorio(r)}>✏️</button>
              {podeExcluir && <button className="icon-btn" title="Excluir relatório" onClick={() => removeItem('relatoriosCelula', r.id)}>🗑️</button>}
            </div> }
          ]}
        />
      </div>

      <Modal title={editing ? 'Editar relatório da célula' : 'Registrar reunião da célula'} open={open} onClose={() => setOpen(false)}>
        <form onSubmit={salvar}>
          <div className="form-grid">
            <FormField label="Célula">
              <select value={form.celulaId} onChange={(e) => mudarCelula(e.target.value)} disabled={user?.perfil === 'lider'}>
                <option value="">Selecione</option>
                {celulasPermitidas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </FormField>
            <FormField label="Data da reunião">
              <input type="date" value={form.dataReuniao} onChange={(e) => setForm({ ...form, dataReuniao: e.target.value })} />
            </FormField>
            <FormField label="Quem preencheu o relatório?">
              <input value={editing?.preenchidoPorNome || user?.nome || ''} readOnly />
            </FormField>
          </div>

          <section className="cell-report-section">
            <div className="cell-report-section-title">
              <h3>Louvor e condução</h3>
              <p>Informe quem serviu e quais louvores foram ministrados na reunião.</p>
            </div>
            <div className="form-grid">
              <FormField label="Quem tocou no louvor?">
                <input value={form.quemTocouLouvor} onChange={(e) => setForm({ ...form, quemTocouLouvor: e.target.value })} placeholder="Nome(s)" />
              </FormField>
              <FormField label="Quem conduziu os louvores?">
                <input value={form.quemConduziuLouvores} onChange={(e) => setForm({ ...form, quemConduziuLouvores: e.target.value })} placeholder="Nome" />
              </FormField>
              <FormField label="Quais louvores foram ministrados?" full>
                <textarea value={form.louvoresMinistrados} onChange={(e) => setForm({ ...form, louvoresMinistrados: e.target.value })} placeholder={"Ex.: Louvor 1\nLouvor 2\nLouvor 3"} />
              </FormField>
            </div>
          </section>

          <section className="cell-report-section">
            <div className="cell-report-section-title">
              <h3>Ministrações</h3>
              <p>Registre os responsáveis por cada momento da célula.</p>
            </div>
            <div className="form-grid">
              <FormField label="Quem ministrou quebra-gelo?">
                <input value={form.quemMinistrouQuebraGelo} onChange={(e) => setForm({ ...form, quemMinistrouQuebraGelo: e.target.value })} />
              </FormField>
              <FormField label="Quem ministrou a Palavra?">
                <input value={form.quemMinistrouPalavra} onChange={(e) => setForm({ ...form, quemMinistrouPalavra: e.target.value })} />
              </FormField>
              <FormField label="Quem ministrou a Cadeira Vazia?">
                <input value={form.quemMinistrouCadeiraVazia} onChange={(e) => setForm({ ...form, quemMinistrouCadeiraVazia: e.target.value })} />
              </FormField>
            </div>
          </section>

          <section className="cell-report-section">
            <div className="cell-report-section-title">
              <h3>Participação dos membros</h3>
              <p>1 = muito baixo • 5 = muito alto.</p>
            </div>
            <div className="participation-scale">
              {[1, 2, 3, 4, 5].map((nivel) => (
                <button
                  key={nivel}
                  type="button"
                  className={`participation-option ${form.nivelParticipacao === nivel ? 'selected' : ''}`}
                  onClick={() => setForm({ ...form, nivelParticipacao: nivel as 1 | 2 | 3 | 4 | 5 })}
                >
                  <strong>{nivel}</strong>
                  <span>{nivel === 1 ? 'Muito baixo' : nivel === 2 ? 'Baixo' : nivel === 3 ? 'Médio' : nivel === 4 ? 'Alto' : 'Muito alto'}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="attendance-section">
            <div className="attendance-header">
              <div>
                <h3><Users size={18} /> Presença dos membros</h3>
                <p>Marque quem participou da reunião. Quem não estiver marcado será contabilizado como ausente.</p>
              </div>
              <div className="actions">
                <button className="btn btn-soft" type="button" onClick={() => marcarTodos(true)}><CheckCheck size={15} /> Marcar todos</button>
                <button className="btn btn-ghost" type="button" onClick={() => marcarTodos(false)}>Limpar</button>
              </div>
            </div>

            <div className="attendance-list">
              {form.presencas.map((presenca) => (
                <label className={`attendance-row ${presenca.presente ? 'present' : ''}`} key={presenca.membroId}>
                  <input type="checkbox" checked={presenca.presente} onChange={(e) => marcarPresenca(presenca.membroId, e.target.checked)} />
                  <span>{presenca.nome}</span>
                  <b>{presenca.presente ? 'Presente' : 'Ausente'}</b>
                </label>
              ))}
              {!form.presencas.length && <div className="empty">Nenhum membro vinculado a esta célula.</div>}
            </div>
          </div>

          <div className="visitor-section">
            <div className="attendance-header">
              <div>
                <h3>Visitantes presentes</h3>
                <p>Cadastro rápido conforme o relatório da reunião: nome e telefone.</p>
              </div>
              <button className="btn btn-soft" type="button" onClick={adicionarVisitante}><Plus size={15} /> Adicionar visitante</button>
            </div>

            <div className="visitor-rows">
              {form.visitantes.map((visitante, index) => (
                <div className="visitor-row" key={index}>
                  <input value={visitante.nome} onChange={(e) => atualizarVisitante(index, 'nome', e.target.value)} placeholder="Nome do visitante" />
                  <input value={visitante.telefone} onChange={(e) => atualizarVisitante(index, 'telefone', e.target.value)} placeholder="Telefone com DDD" />
                  <button className="icon-btn" type="button" onClick={() => removerVisitante(index)} title="Remover visitante">✕</button>
                </div>
              ))}
              {!form.visitantes.length && <div className="empty compact">Nenhum visitante adicionado.</div>}
            </div>
          </div>

          <section className="cell-report-section">
            <div className="cell-report-section-title">
              <h3>Oração e testemunhos</h3>
              <p>Registre somente o necessário para acompanhamento pastoral.</p>
            </div>

            <div className="yes-no-grid">
              <div className="yes-no-card">
                <strong>Houve algum pedido de ORAÇÃO compartilhado na célula?</strong>
                <div className="segmented-control">
                  <button type="button" className={!form.houvePedidoOracao ? 'selected' : ''} onClick={() => setForm({ ...form, houvePedidoOracao: false, pedidoOracaoDescricao: '' })}>Não</button>
                  <button type="button" className={form.houvePedidoOracao ? 'selected' : ''} onClick={() => setForm({ ...form, houvePedidoOracao: true })}>Sim</button>
                </div>
                {form.houvePedidoOracao && (
                  <label>Descreva brevemente e informe quem pediu
                    <textarea value={form.pedidoOracaoDescricao} onChange={(e) => setForm({ ...form, pedidoOracaoDescricao: e.target.value })} placeholder="Descrição breve do pedido e nome da pessoa" />
                  </label>
                )}
              </div>

              <div className="yes-no-card">
                <strong>Houve algum testemunho compartilhado na célula?</strong>
                <div className="segmented-control">
                  <button type="button" className={!form.houveTestemunho ? 'selected' : ''} onClick={() => setForm({ ...form, houveTestemunho: false, testemunhoDescricao: '' })}>Não</button>
                  <button type="button" className={form.houveTestemunho ? 'selected' : ''} onClick={() => setForm({ ...form, houveTestemunho: true })}>Sim</button>
                </div>
                {form.houveTestemunho && (
                  <label>Descreva brevemente e informe quem compartilhou
                    <textarea value={form.testemunhoDescricao} onChange={(e) => setForm({ ...form, testemunhoDescricao: e.target.value })} placeholder="Descrição breve do testemunho e nome da pessoa" />
                  </label>
                )}
              </div>
            </div>
          </section>

          <div className="report-form-summary">
            <span><strong>{form.presencas.filter((p) => p.presente).length}</strong> presentes</span>
            <span><strong>{form.presencas.filter((p) => !p.presente).length}</strong> ausentes</span>
            <span><strong>{form.visitantes.filter((v) => v.nome.trim()).length}</strong> visitantes</span>
            <span><strong>{form.nivelParticipacao}/5</strong> participação</span>
          </div>

          <div className="modal-actions-right">
            <button className="btn btn-soft" type="button" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="btn btn-success" type="submit">Salvar relatório</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
