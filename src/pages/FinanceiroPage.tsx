import { FormEvent, useMemo, useState } from 'react';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import FormField from '../components/FormField';
import KpiCard from '../components/KpiCard';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { useChurchData } from '../contexts/ChurchDataContext';
import { exportarXlsx } from '../services/exportXlsx';
import { LancamentoFinanceiro } from '../types';
import { dataBR, moedaBR, normalizarBusca } from '../utils/format';

const initialForm: Omit<LancamentoFinanceiro, 'id'> = {
  igrejaId: '', data: '', tipo: 'Entrada', categoria: '', descricao: '', valor: 0, formaPagamento: '', responsavel: '', ativo: true
};

export default function FinanceiroPage() {
  const { user } = useAuth();
  const { financeiro, createItem, updateItem, removeItem } = useChurchData();
  const [busca, setBusca] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LancamentoFinanceiro | null>(null);
  const [form, setForm] = useState<Omit<LancamentoFinanceiro, 'id'>>(initialForm);

  const rows = useMemo(() => {
    const q = normalizarBusca(busca);
    if (!q) return financeiro;
    return financeiro.filter((f) => [f.categoria, f.descricao, f.tipo, f.formaPagamento, f.responsavel].some((x) => normalizarBusca(x).includes(q)));
  }, [busca, financeiro]);

  const entradas = rows.filter((x) => x.tipo === 'Entrada').reduce((sum, item) => sum + Number(item.valor || 0), 0);
  const saidas = rows.filter((x) => x.tipo === 'Saída').reduce((sum, item) => sum + Number(item.valor || 0), 0);

  function novo() { setEditing(null); setForm({ ...initialForm, igrejaId: user?.igrejaId || '' }); setOpen(true); }
  function editar(row: LancamentoFinanceiro) { setEditing(row); const { id: _id, ...rest } = row; setForm(rest); setOpen(true); }
  async function salvar(e: FormEvent) { e.preventDefault(); if (!form.data || !form.categoria) return alert('Informe data e categoria.'); if (editing) await updateItem('financeiro', editing.id, form); else await createItem('financeiro', form); setOpen(false); }

  return (
    <>
      <PageHeader title="Financeiro" subtitle="Controle de entradas, saídas, categorias e relatórios financeiros." actions={<><button className="btn btn-soft" onClick={() => exportarXlsx(rows, 'financeiro_igreja360.csv', 'Financeiro')}>Exportar XLSX</button><button className="btn btn-primary" onClick={novo}>+ Novo lançamento</button></>} />
      <div className="stats-grid"><KpiCard label="Entradas" value={moedaBR(entradas)} /><KpiCard label="Saídas" value={moedaBR(saidas)} /><KpiCard label="Saldo" value={moedaBR(entradas - saidas)} /></div>
      <div className="panel">
        <div className="panel-header"><div className="panel-title"><h3>Lançamentos</h3><span>{rows.length} registro(s)</span></div><input className="search-input" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar lançamento" /></div>
        <DataTable<LancamentoFinanceiro> rows={rows} columns={[
          { header: 'Data', render: (r) => dataBR(r.data) },
          { header: 'Tipo', render: (r) => <Badge color={r.tipo === 'Entrada' ? 'green' : 'red'}>{r.tipo}</Badge> },
          { header: 'Categoria', render: (r) => r.categoria },
          { header: 'Descrição', render: (r) => r.descricao || '-' },
          { header: 'Valor', render: (r) => <strong>{moedaBR(r.valor)}</strong> },
          { header: 'Forma', render: (r) => r.formaPagamento || '-' },
          { header: 'Ações', render: (r) => <div className="actions"><button className="icon-btn" onClick={() => editar(r)}>✏️</button><button className="icon-btn" onClick={() => removeItem('financeiro', r.id)}>🗑️</button></div> }
        ]} />
      </div>
      <Modal title={editing ? 'Editar lançamento' : 'Novo lançamento'} open={open} onClose={() => setOpen(false)}>
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
