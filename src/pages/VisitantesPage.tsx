import { FormEvent, useMemo, useState } from 'react';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import FormField from '../components/FormField';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { useChurchData } from '../contexts/ChurchDataContext';
import { exportarXlsx } from '../services/exportXlsx';
import { Visitante } from '../types';
import { dataBR, normalizarBusca } from '../utils/format';

const initialForm: Omit<Visitante, 'id'> = {
  igrejaId: '', nome: '', telefone: '', origem: '', primeiraVisita: '', status: 'Novo', responsavel: '', observacoes: '', ativo: true
};

export default function VisitantesPage() {
  const { user } = useAuth();
  const { visitantes, createItem, updateItem, removeItem } = useChurchData();
  const [busca, setBusca] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Visitante | null>(null);
  const [form, setForm] = useState<Omit<Visitante, 'id'>>(initialForm);

  const rows = useMemo(() => {
    const q = normalizarBusca(busca);
    if (!q) return visitantes;
    return visitantes.filter((v) => [v.nome, v.telefone, v.origem, v.status, v.responsavel].some((x) => normalizarBusca(x).includes(q)));
  }, [busca, visitantes]);

  function novo() {
    setEditing(null);
    setForm({ ...initialForm, igrejaId: user?.igrejaId || '' });
    setOpen(true);
  }

  function editar(row: Visitante) {
    setEditing(row);
    const { id: _id, ...rest } = row;
    setForm(rest);
    setOpen(true);
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!form.nome) return alert('Informe o nome do visitante.');
    if (editing) await updateItem('visitantes', editing.id, form);
    else await createItem('visitantes', form);
    setOpen(false);
  }

  return (
    <>
      <PageHeader
        title="Visitantes"
        subtitle="Controle de primeiro contato, origem, retorno e integração de visitantes."
        actions={<><button className="btn btn-soft" onClick={() => exportarXlsx(rows, 'visitantes_igreja360.csv', 'Visitantes')}>Exportar XLSX</button><button className="btn btn-primary" onClick={novo}>+ Novo visitante</button></>}
      />
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title"><h3>Lista de visitantes</h3><span>{rows.length} registro(s) exibido(s)</span></div>
          <input className="search-input" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar visitante" />
        </div>
        <DataTable<Visitante>
          rows={rows}
          minWidth={950}
          columns={[
            { header: 'Nome', render: (r) => <strong>{r.nome}</strong> },
            { header: 'Telefone', render: (r) => r.telefone || '-' },
            { header: 'Origem', render: (r) => r.origem || '-' },
            { header: 'Primeira visita', render: (r) => dataBR(r.primeiraVisita) },
            { header: 'Status', render: (r) => <Badge color={r.status === 'Integrado' ? 'green' : r.status === 'Sem retorno' ? 'red' : 'orange'}>{r.status}</Badge> },
            { header: 'Responsável', render: (r) => r.responsavel || '-' },
            { header: 'Ações', render: (r) => <div className="actions"><button className="icon-btn" onClick={() => editar(r)}>✏️</button><button className="icon-btn" onClick={() => removeItem('visitantes', r.id)}>🗑️</button></div> }
          ]}
        />
      </div>
      <Modal title={editing ? 'Editar visitante' : 'Novo visitante'} open={open} onClose={() => setOpen(false)}>
        <form onSubmit={salvar}>
          <div className="form-grid">
            <FormField label="Nome"><input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></FormField>
            <FormField label="Telefone"><input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} /></FormField>
            <FormField label="Origem"><input value={form.origem} onChange={(e) => setForm({ ...form, origem: e.target.value })} /></FormField>
            <FormField label="Primeira visita"><input type="date" value={form.primeiraVisita} onChange={(e) => setForm({ ...form, primeiraVisita: e.target.value })} /></FormField>
            <FormField label="Status"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Visitante['status'] })}><option>Novo</option><option>Em acompanhamento</option><option>Integrado</option><option>Sem retorno</option></select></FormField>
            <FormField label="Responsável"><input value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} /></FormField>
            <FormField label="Observações" full><textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} /></FormField>
          </div>
          <div className="modal-actions-right"><button className="btn btn-soft" type="button" onClick={() => setOpen(false)}>Cancelar</button><button className="btn btn-success" type="submit">Salvar</button></div>
        </form>
      </Modal>
    </>
  );
}
