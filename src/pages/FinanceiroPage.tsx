import { FormEvent, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import FormField from '../components/FormField';
import KpiCard from '../components/KpiCard';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { useChurchData } from '../contexts/ChurchDataContext';
import { exportarXlsx } from '../services/exportXlsx';
import { LancamentoFinanceiro, SolicitacaoFinanceira } from '../types';
import { dataBR, moedaBR, normalizarBusca } from '../utils/format';

const initialForm: Omit<LancamentoFinanceiro, 'id'> = {
  igrejaId: '', data: '', tipo: 'Entrada', categoria: '', descricao: '', valor: 0, formaPagamento: '', responsavel: '', ativo: true
};

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function FinanceiroPage() {
  const { user } = useAuth();
  const { financeiro, solicitacoesFinanceiras, createItem, updateItem, removeItem } = useChurchData();
  const [busca, setBusca] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LancamentoFinanceiro | null>(null);
  const [form, setForm] = useState<Omit<LancamentoFinanceiro, 'id'>>(initialForm);

  const rows = useMemo(() => {
    const q = normalizarBusca(busca);
    if (!q) return financeiro;
    return financeiro.filter((f) => [f.categoria, f.descricao, f.tipo, f.formaPagamento, f.responsavel].some((x) => normalizarBusca(x).includes(q)));
  }, [busca, financeiro]);

  const aprovadas = useMemo(
    () => solicitacoesFinanceiras.filter((s) => s.status === 'Aprovada para financeiro'),
    [solicitacoesFinanceiras]
  );

  const entradas = rows.filter((x) => x.tipo === 'Entrada').reduce((sum, item) => sum + Number(item.valor || 0), 0);
  const saidas = rows.filter((x) => x.tipo === 'Saída').reduce((sum, item) => sum + Number(item.valor || 0), 0);

  function novo() {
    setEditing(null);
    setForm({ ...initialForm, igrejaId: user?.igrejaId || '', data: hojeISO(), responsavel: user?.nome || '' });
    setOpen(true);
  }

  function editar(row: LancamentoFinanceiro) {
    setEditing(row);
    const { id: _id, ...rest } = row;
    setForm(rest);
    setOpen(true);
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!form.data || !form.categoria) return alert('Informe data e categoria.');
    if (editing) await updateItem('financeiro', editing.id, form);
    else await createItem('financeiro', form);
    setOpen(false);
  }

  async function lancarSolicitacao(row: SolicitacaoFinanceira) {
    if (!user) return;
    const confirmar = window.confirm(`Lançar ${row.tipo.toLowerCase()} de ${moedaBR(row.valor)} no Financeiro?`);
    if (!confirmar) return;

    const lancamentoId = await createItem('financeiro', {
      igrejaId: user.igrejaId,
      data: hojeISO(),
      tipo: 'Saída',
      categoria: row.categoria,
      descricao: `[${row.tipo}] ${row.titulo} — ${row.descricao}`,
      valor: row.valor,
      formaPagamento: 'A definir',
      responsavel: user.nome,
      ativo: true
    });

    await updateItem('solicitacoesFinanceiras', row.id, {
      status: 'Lançada no financeiro',
      processadoFinanceiroPorId: user.uid,
      processadoFinanceiroPorNome: user.nome,
      processadoFinanceiroEm: new Date().toISOString(),
      lancamentoFinanceiroId: String(lancamentoId || '')
    });
  }

  return (
    <>
      <PageHeader
        title="Financeiro"
        subtitle="Entradas, saídas e solicitações previamente aprovadas pelo fluxo pastoral."
        actions={<>
          <button className="btn btn-soft" onClick={() => exportarXlsx(rows, 'financeiro_igreja360.csv', 'Financeiro')}>Exportar XLSX</button>
          <button className="btn btn-primary" onClick={novo}>+ Novo lançamento manual</button>
        </>}
      />

      <div className="stats-grid">
        <KpiCard label="Entradas" value={moedaBR(entradas)} />
        <KpiCard label="Saídas" value={moedaBR(saidas)} />
        <KpiCard label="Saldo" value={moedaBR(entradas - saidas)} />
        <KpiCard label="Aprovadas aguardando" value={aprovadas.length} hint="Prontas para lançamento" />
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <h3>Solicitações aprovadas aguardando Financeiro</h3>
            <span>Somente pedidos já aprovados pelo Pastor/Admin aparecem aqui.</span>
          </div>
          <Badge color={aprovadas.length ? 'orange' : 'green'}>{aprovadas.length} pendente(s)</Badge>
        </div>
        <DataTable<SolicitacaoFinanceira>
          rows={aprovadas}
          minWidth={1050}
          columns={[
            { header: 'Data', render: (r) => dataBR(r.dataSolicitacao) },
            { header: 'Tipo', render: (r) => <Badge color={r.tipo === 'Reembolso' ? 'purple' : 'teal'}>{r.tipo}</Badge> },
            { header: 'Solicitante', render: (r) => r.solicitanteNome },
            { header: 'Descrição', render: (r) => <div><strong>{r.titulo}</strong><div className="muted-small">{r.descricao}</div></div> },
            { header: 'Categoria', render: (r) => r.categoria },
            { header: 'Valor', render: (r) => <strong>{moedaBR(r.valor)}</strong> },
            { header: 'Aprovado por', render: (r) => r.aprovadoPorNome || '-' },
            { header: 'Ação', render: (r) => <button className="btn btn-success compact-btn" onClick={() => lancarSolicitacao(r)}><CheckCircle2 size={15} /> Lançar no financeiro</button> }
          ]}
        />
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title"><h3>Lançamentos</h3><span>{rows.length} registro(s)</span></div>
          <input className="search-input" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar lançamento" />
        </div>
        <DataTable<LancamentoFinanceiro> rows={rows} columns={[
          { header: 'Data', render: (r) => dataBR(r.data) },
          { header: 'Tipo', render: (r) => <Badge color={r.tipo === 'Entrada' ? 'green' : 'red'}>{r.tipo}</Badge> },
          { header: 'Categoria', render: (r) => r.categoria },
          { header: 'Descrição', render: (r) => r.descricao || '-' },
          { header: 'Valor', render: (r) => <strong>{moedaBR(r.valor)}</strong> },
          { header: 'Forma', render: (r) => r.formaPagamento || '-' },
          { header: 'Responsável', render: (r) => r.responsavel || '-' },
          { header: 'Ações', render: (r) => <div className="actions"><button className="icon-btn" onClick={() => editar(r)}>✏️</button><button className="icon-btn" onClick={() => removeItem('financeiro', r.id)}>🗑️</button></div> }
        ]} />
      </div>

      <Modal title={editing ? 'Editar lançamento' : 'Novo lançamento manual'} open={open} onClose={() => setOpen(false)}>
        <form onSubmit={salvar}><div className="form-grid">
          <FormField label="Data"><input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} /></FormField>
          <FormField label="Tipo"><select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as LancamentoFinanceiro['tipo'] })}><option>Entrada</option><option>Saída</option></select></FormField>
          <FormField label="Categoria"><input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} /></FormField>
          <FormField label="Valor"><input type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })} /></FormField>
          <FormField label="Forma de pagamento"><input value={form.formaPagamento} onChange={(e) => setForm({ ...form, formaPagamento: e.target.value })} /></FormField>
          <FormField label="Responsável"><input value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} /></FormField>
          <FormField label="Descrição" full><textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></FormField>
        </div><div className="modal-actions-right"><button className="btn btn-soft" type="button" onClick={() => setOpen(false)}>Cancelar</button><button className="btn btn-success" type="submit">Salvar</button></div></form>
      </Modal>
    </>
  );
}
